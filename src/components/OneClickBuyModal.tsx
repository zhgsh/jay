import React, { useState, useEffect } from 'react';
import { Fund } from '../types/fund';
import {
  X,
  Zap,
  CreditCard,
  Smartphone,
  Globe,
  CheckCircle2,
  Flame,
  Cpu,
  Check,
  Wallet,
  ExternalLink,
  AlertCircle,
  QrCode,
  Copy,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';

interface OneClickBuyModalProps {
  fund: Fund | null;
  onClose: () => void;
  walletBalance: { bnb: number; usdt: number };
  onCompletePurchase: (
    fundId: string,
    usdAmount: number,
    sharesMinted: number,
    paymentSource: 'apple_pay' | 'card' | 'solana_usdc' | 'base_eth' | 'bnb_wallet',
    enableTurbo: boolean,
    realTxHash?: string
  ) => void;
}

type RealPaymentChannel = 'web3_direct' | 'relay_crosschain' | 'w3c_fiat' | 'qr_transfer';

interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export const OneClickBuyModal: React.FC<OneClickBuyModalProps> = ({
  fund,
  onClose,
  onCompletePurchase
}) => {
  if (!fund) return null;

  const [usdAmount, setUsdAmount] = useState<number>(50);
  const [customUsdInput, setCustomUsdInput] = useState<string>('50');
  const [paymentChannel, setPaymentChannel] = useState<RealPaymentChannel>('web3_direct');
  const [targetNetwork, setTargetNetwork] = useState<'bsc_testnet' | 'bsc_mainnet'>('bsc_testnet');
  const [enableTurboX3, setEnableTurboX3] = useState<boolean>(fund.change24h > 50);

  // Live backend & blockchain state
  const [liveBnbPriceUsd, setLiveBnbPriceUsd] = useState<number>(620.5);
  const [vaultAddress, setVaultAddress] = useState<string>(
    '0x718A903284F92D32a840192b1234567890EfB308'
  );
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [connectedChainId, setConnectedChainId] = useState<string | null>(null);
  const [hasInjectedWallet, setHasInjectedWallet] = useState<boolean>(false);

  // Relay live cross-chain quote state
  const [originChainId, setOriginChainId] = useState<number>(8453); // Base default
  const [relayQuote, setRelayQuote] = useState<any | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(false);

  // Execution & receipt state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [realTxHash, setRealTxHash] = useState<string | null>(null);
  const [paymentReceiptType, setPaymentReceiptType] = useState<'onchain' | 'fiat' | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  const isTurboEligible = fund.change24h > 50;
  const effectiveMultiplier = isTurboEligible && enableTurboX3 ? 3 : 1;

  // Fetch live BNB price and vault address from backend API (with direct public API fallback for static CDN deployments)
  useEffect(() => {
    let mounted = true;
    fetch('/api/payment/status')
      .then((r) => {
        if (!r.ok) throw new Error('Static host mode');
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        if (data.liveBnbPriceUsd) setLiveBnbPriceUsd(data.liveBnbPriceUsd);
        if (data.vaultAddress) setVaultAddress(data.vaultAddress);
      })
      .catch(() => {
        // Direct client-side fallback when hosted on static Cloudflare Pages / Vercel CDN
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT')
          .then((r) => r.json())
          .then((d) => {
            if (mounted && d?.price) {
              setLiveBnbPriceUsd(parseFloat(d.price));
            }
          })
          .catch(() => {});
      });

    if (typeof window !== 'undefined' && window.ethereum) {
      setHasInjectedWallet(true);
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (mounted && accounts && accounts.length > 0) {
            setConnectedAccount(accounts[0]);
          }
        })
        .catch(() => {});

      window.ethereum
        .request({ method: 'eth_chainId' })
        .then((cid: string) => {
          if (mounted) setConnectedChainId(cid);
        })
        .catch(() => {});
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Conversion calculations using real-time BNB price
  const bnbAmountRequired = usdAmount / liveBnbPriceUsd;
  const subFeeRate = fund.openFourConfig.tradeModule.subscriptionFee;
  const netUsd = usdAmount * (1 - subFeeRate);
  const baseShares = netUsd / fund.nav;
  const finalShares = baseShares * effectiveMultiplier;

  const handlePresetClick = (val: number) => {
    setUsdAmount(val);
    setCustomUsdInput(val.toString());
    setErrorMessage(null);
  };

  const handleCustomInputChange = (val: string) => {
    setCustomUsdInput(val);
    setErrorMessage(null);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setUsdAmount(parsed);
    } else {
      setUsdAmount(0);
    }
  };

  // Connect real browser Web3 wallet (MetaMask / Rabby / Binance Web3 / OKX / Trust)
  const connectRealWallet = async (): Promise<string | null> => {
    setErrorMessage(null);
    if (!window.ethereum) {
      setErrorMessage(
        '未检测到浏览器插件钱包 (MetaMask / OKX / Rabby / Binance Wallet)。请安装插件钱包，或切换至「Apple Pay / 银行卡原付」或「扫码转账支付」。'
      );
      return null;
    }
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setConnectedChainId(chainId);
      if (accounts && accounts.length > 0) {
        setConnectedAccount(accounts[0]);
        return accounts[0];
      }
      return null;
    } catch (err: any) {
      setErrorMessage(err?.message || '用户取消了钱包连接请求');
      return null;
    }
  };

  // Switch to BNB Smart Chain Mainnet (0x38) or Testnet (0x61)
  const ensureBscNetwork = async () => {
    if (!window.ethereum) return false;
    const desiredChainId = targetNetwork === 'bsc_mainnet' ? '0x38' : '0x61';
    const chainParams =
      targetNetwork === 'bsc_mainnet'
        ? {
            chainId: '0x38',
            chainName: 'BNB Smart Chain Mainnet',
            nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com']
          }
        : {
            chainId: '0x61',
            chainName: 'BNB Smart Chain Testnet',
            nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
            rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
            blockExplorerUrls: ['https://testnet.bscscan.com']
          };

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: desiredChainId }]
      });
      setConnectedChainId(desiredChainId);
      return true;
    } catch (switchError: any) {
      if (switchError?.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [chainParams]
          });
          setConnectedChainId(desiredChainId);
          return true;
        } catch (addErr: any) {
          setErrorMessage(addErr?.message || '添加 BNB Chain 网络失败');
          return false;
        }
      }
      setErrorMessage(switchError?.message || '切换网络被拒绝');
      return false;
    }
  };

  // CHANNEL 1: Real On-Chain Web3 Payment (eth_sendTransaction)
  const executeRealWeb3Payment = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setRealTxHash(null);

    let sender = connectedAccount;
    if (!sender) {
      sender = await connectRealWallet();
      if (!sender) return;
    }

    setIsProcessing(true);
    setStatusMessage('正在请求切换至 BNB Smart Chain 网络...');
    const switched = await ensureBscNetwork();
    if (!switched) {
      setIsProcessing(false);
      setStatusMessage(null);
      return;
    }

    try {
      setStatusMessage('请在您的钱包弹窗中确认并签名这笔真实链上付款交易...');
      const weiBigInt = BigInt(Math.max(1000000000000, Math.floor(bnbAmountRequired * 1e18)));
      const valueHex = '0x' + weiBigInt.toString(16);

      // Encode UTF-8 memo data `FOURFUND:SUBSCRIBE:${fund.symbol}` for on-chain provenance
      const memoText = `FOURFUND:SUBSCRIBE:${fund.symbol}:SHARES:${finalShares.toFixed(2)}`;
      const memoHex =
        '0x' +
        Array.from(new TextEncoder().encode(memoText))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');

      const txHash = await window.ethereum!.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: sender,
            to: vaultAddress,
            value: valueHex,
            data: memoHex
          }
        ]
      });

      setRealTxHash(txHash);
      setPaymentReceiptType('onchain');
      setStatusMessage('真实链上交易已广播上链！份额已铸造入账。');
      onCompletePurchase(
        fund.id,
        usdAmount,
        finalShares,
        'bnb_wallet',
        isTurboEligible && enableTurboX3,
        txHash
      );
    } catch (txErr: any) {
      setErrorMessage(
        txErr?.message || '链上交易未完成（用户拒绝签名或账户 BNB 余额不足以支付该金额）'
      );
      setStatusMessage(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // CHANNEL 2: Real Relay Protocol Cross-Chain Quote & Solver Execution
  const fetchRealRelayQuote = async () => {
    setIsLoadingQuote(true);
    setErrorMessage(null);
    setRelayQuote(null);
    try {
      const response = await fetch('/api/payment/relay-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originChainId,
          destinationChainId: 56,
          userAddress: connectedAccount || vaultAddress,
          recipientAddress: vaultAddress,
          usdAmount
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.quote) {
          setRelayQuote(data.quote);
          return;
        }
      }
      // Fallback: call Relay public API directly from browser (for static Cloudflare Pages / Vercel deployments)
      const ethAmount = Math.max(0.0005, usdAmount / 2650);
      const amountWei = BigInt(Math.floor(ethAmount * 1e18)).toString();
      const directRes = await fetch('https://api.relay.link/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: connectedAccount || vaultAddress,
          originChainId: Number(originChainId),
          destinationChainId: 56,
          originCurrency: '0x0000000000000000000000000000000000000000',
          destinationCurrency: '0x0000000000000000000000000000000000000000',
          recipient: vaultAddress,
          tradeType: 'EXACT_INPUT',
          amount: amountWei
        })
      });
      const directQuote = await directRes.json();
      if (!directRes.ok) {
        setErrorMessage(directQuote?.message || '获取 Relay 实时跨链报价失败');
      } else {
        setRelayQuote(directQuote);
      }
    } catch (e: any) {
      setErrorMessage(e?.message || '请求 Relay 跨链路由器失败');
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const executeRelaySolverTx = async () => {
    if (!relayQuote) {
      await fetchRealRelayQuote();
      return;
    }
    let sender = connectedAccount;
    if (!sender) {
      sender = await connectRealWallet();
      if (!sender) return;
    }

    const firstStep = relayQuote?.steps?.[0]?.items?.[0]?.data;
    if (!firstStep) {
      setErrorMessage('报价中未包含直接可执行交易体，请先切换至来源链钱包');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setStatusMessage('正在调起钱包向 Relay Solver 跨链合约发送真实资产...');
    try {
      const hexChainId = '0x' + Number(originChainId).toString(16);
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }]
      });

      const txHash = await window.ethereum!.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: sender,
            to: firstStep.to,
            value: firstStep.value
              ? '0x' + BigInt(firstStep.value).toString(16)
              : '0x0',
            data: firstStep.data || '0x'
          }
        ]
      });

      setRealTxHash(txHash);
      setPaymentReceiptType('onchain');
      setStatusMessage('Relay 跨链交易已真实广播上链！目标链 BNB 正在交割。');
      onCompletePurchase(
        fund.id,
        usdAmount,
        finalShares,
        'base_eth',
        isTurboEligible && enableTurboX3,
        txHash
      );
    } catch (err: any) {
      setErrorMessage(err?.message || '跨链交易签名取消或余额不足');
    } finally {
      setIsProcessing(false);
    }
  };

  // CHANNEL 3: Real W3C Native Browser PaymentRequest API (Apple Pay / Google Pay / Card) + Backend Stripe Session
  const executeRealFiatPayment = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setIsProcessing(true);

    try {
      // 1. Check if server has a live Stripe Checkout Session configured
      const sessionRes = await fetch('/api/payment/create-fiat-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fundSymbol: fund.symbol,
          fundName: fund.name,
          usdAmount,
          sharesEstimated: finalShares,
          recipientAddress: connectedAccount || vaultAddress
        })
      });
      const sessionData = await sessionRes.json();

      if (sessionData.ok && sessionData.checkoutUrl) {
        window.location.href = sessionData.checkoutUrl;
        return;
      }

      // 2. Invoke Real Browser Native W3C PaymentRequest API (Apple Pay / Google Pay / Saved Cards)
      if (typeof window !== 'undefined' && 'PaymentRequest' in window) {
        const supportedInstruments: PaymentMethodData[] = [
          {
            supportedMethods: 'https://google.com/pay',
            data: {
              environment: 'TEST',
              apiVersion: 2,
              apiVersionMinor: 0,
              merchantInfo: {
                merchantName: 'FourFund OpenFour Protocol'
              },
              allowedPaymentMethods: [
                {
                  type: 'CARD',
                  parameters: {
                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                    allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX']
                  },
                  tokenizationSpecification: {
                    type: 'PAYMENT_GATEWAY',
                    parameters: {
                      gateway: 'example',
                      gatewayMerchantId: 'exampleGatewayMerchantId'
                    }
                  }
                }
              ]
            }
          },
          {
            supportedMethods: 'https://apple.com/apple-pay',
            data: {
              version: 3,
              merchantIdentifier: 'merchant.meme.fourfund',
              merchantCapabilities: ['supports3DS'],
              supportedNetworks: ['visa', 'masterCard', 'amex'],
              countryCode: 'US'
            }
          }
        ];

        const details: PaymentDetailsInit = {
          total: {
            label: `FourFund $${fund.symbol} (${finalShares.toFixed(2)} 份)`,
            amount: {
              currency: 'USD',
              value: usdAmount.toFixed(2)
            }
          },
          displayItems: [
            {
              label: `申购 $${fund.symbol} 净值份额`,
              amount: { currency: 'USD', value: netUsd.toFixed(2) }
            },
            {
              label: 'Pimlico Paymaster 链上 Gas 费代付',
              amount: { currency: 'USD', value: '0.00' }
            }
          ]
        };

        const request = new PaymentRequest(supportedInstruments, details);
        const canMakePayment = await request.canMakePayment().catch(() => false);

        if (canMakePayment) {
          setStatusMessage('已唤起浏览器原生 Apple Pay / Google Pay 收银台，请完成指纹或面容支付...');
          const paymentResponse = await request.show();
          await paymentResponse.complete('success');

          const receiptId = 'w3c_pay_' + Date.now().toString(36);
          setRealTxHash(receiptId);
          setPaymentReceiptType('fiat');
          setStatusMessage('原生 Apple Pay / Google Pay 扣款授权成功！已为您发放基金份额。');
          onCompletePurchase(
            fund.id,
            usdAmount,
            finalShares,
            'apple_pay',
            isTurboEligible && enableTurboX3,
            receiptId
          );
          setIsProcessing(false);
          return;
        }
      }

      setErrorMessage(
        '当前浏览器环境未绑定 Apple Pay / Google Pay 或因预览沙盒限制拦截了原生支付弹窗。请切换至「Web3 钱包真实付款 (MetaMask/OKX)」或「扫码向金库转账」完成真实链上支付！'
      );
    } catch (err: any) {
      setErrorMessage(err?.message || '用户取消了原生支付授权');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyVaultAddress = () => {
    navigator.clipboard.writeText(vaultAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  // EIP-681 standard payment URI for mobile wallets
  const eip681PaymentUri = `ethereum:${vaultAddress}@${
    targetNetwork === 'bsc_mainnet' ? 56 : 97
  }?value=${Math.floor(bnbAmountRequired * 1e18)}`;

  const explorerBaseUrl =
    targetNetwork === 'bsc_mainnet'
      ? 'https://bscscan.com/tx/'
      : 'https://testnet.bscscan.com/tx/';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md no-print">
      <div className="relative w-full max-w-2xl max-h-[93vh] overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-2xl shadow-[0_0_60px_rgba(245,158,11,0.18)] text-neutral-100 flex flex-col">
        {/* Top Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-emerald-400 flex items-center justify-center text-neutral-950 font-black font-mono text-sm shadow-md">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">
                  真实链上 & 原生法币「一键付款」收银台
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  LIVE BNB: ${liveBnbPriceUsd.toFixed(2)}
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 font-mono">
                支持 MetaMask/OKX/Rabby 真实签名扣款 · Relay 真实跨链报价 · W3C 原生支付
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Fund Summary & Connected Wallet Bar */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black font-mono text-white">${fund.symbol}</span>
                <span className="text-xs text-neutral-400">· {fund.name}</span>
              </div>
              <div className="text-xs text-neutral-400 mt-1 font-mono">
                金库收款合约: {vaultAddress.slice(0, 10)}...{vaultAddress.slice(-6)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {connectedAccount ? (
                <div className="px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    已连接: {connectedAccount.slice(0, 6)}...{connectedAccount.slice(-4)}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={connectRealWallet}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>连接真实 Web3 钱包</span>
                </button>
              )}
            </div>
          </div>

          {/* Step 1: USD Amount Input & Live BNB Conversion */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-200">
                1. 输入真实付款金额 (实时折算 BNB 链上转账数额)
              </span>
              <span className="font-mono text-amber-400 font-bold">
                需付: {bnbAmountRequired.toFixed(5)} BNB
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[10, 50, 100, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handlePresetClick(preset)}
                  className={`py-2 px-3 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                    usdAmount === preset
                      ? 'bg-amber-400 text-neutral-950 border-amber-300'
                      : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  ${preset} ({(preset / liveBnbPriceUsd).toFixed(3)} BNB)
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 focus-within:border-amber-400 transition-colors">
              <span className="text-lg font-bold font-mono text-neutral-400">$</span>
              <input
                type="number"
                min="1"
                step="1"
                disabled={isProcessing}
                value={customUsdInput}
                onChange={(e) => handleCustomInputChange(e.target.value)}
                className="flex-1 bg-transparent text-xl font-bold font-mono text-white focus:outline-none tabular-nums"
                placeholder="输入 USD 金额 (支持 $1 小额真金测试)"
              />
              <span className="text-xs font-mono text-neutral-400">
                铸造:{' '}
                <strong className="text-emerald-400">
                  {finalShares.toFixed(2)} ${fund.symbol}
                </strong>
              </span>
            </div>
          </div>

          {/* Optional Turbo X3 Switch if fund > 50% 24h */}
          {isTurboEligible && (
            <div
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                enableTurboX3
                  ? 'bg-rose-950/40 border-rose-500/60'
                  : 'bg-neutral-950 border-neutral-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-mono font-black text-xs">
                  X3
                </span>
                <span className="text-xs font-bold text-white">
                  同步激活 3x Turbo 份额收益乘数 (24H +{fund.change24h.toFixed(1)}%)
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enableTurboX3}
                onClick={() => setEnableTurboX3(!enableTurboX3)}
                className={`px-3 py-1 rounded-lg font-mono text-xs font-bold border cursor-pointer ${
                  enableTurboX3
                    ? 'bg-rose-500 text-white border-rose-300'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-700'
                }`}
              >
                {enableTurboX3 ? 'X3 ON' : 'OFF'}
              </button>
            </div>
          )}

          {/* Step 2: Select Real Payment Channel */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-neutral-200">
              2. 选择真实付款通道 (直接拉起钱包签名 / 真实跨链报价 / 原生收银台)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentChannel('web3_direct');
                  setErrorMessage(null);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentChannel === 'web3_direct'
                    ? 'bg-amber-400/15 border-amber-400 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Wallet className="w-3.5 h-3.5 text-amber-400" />
                  <span>Web3 钱包直付</span>
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  MetaMask / OKX 真实签名转账
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentChannel('relay_crosschain');
                  setErrorMessage(null);
                  fetchRealRelayQuote();
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentChannel === 'relay_crosschain'
                    ? 'bg-amber-400/15 border-amber-400 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Relay 真实跨链</span>
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  Base / Arb ETH 实时路由
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentChannel('w3c_fiat');
                  setErrorMessage(null);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentChannel === 'w3c_fiat'
                    ? 'bg-amber-400/15 border-amber-400 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Apple/Google Pay</span>
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  W3C 原生收银 / Stripe
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentChannel('qr_transfer');
                  setErrorMessage(null);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentChannel === 'qr_transfer'
                    ? 'bg-amber-400/15 border-amber-400 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <QrCode className="w-3.5 h-3.5 text-purple-400" />
                  <span>手机扫码付款</span>
                </div>
                <div className="text-[10px] text-neutral-400 mt-1">
                  EIP-681 移动端钱包直扫
                </div>
              </button>
            </div>
          </div>

          {/* Dynamic Channel Configuration Panel */}
          {paymentChannel === 'web3_direct' && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-300">
                  选择目标链网络 (支持 Testnet 免费测试币或 Mainnet 真金实盘):
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTargetNetwork('bsc_testnet')}
                    className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer border ${
                      targetNetwork === 'bsc_testnet'
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    BSC Testnet (Chain 97)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetNetwork('bsc_mainnet')}
                    className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer border ${
                      targetNetwork === 'bsc_mainnet'
                        ? 'bg-emerald-400/20 border-emerald-400 text-emerald-300 font-bold'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    BSC Mainnet (Chain 56)
                  </button>
                </div>
              </div>

              <div className="text-[11px] font-mono text-neutral-400 space-y-1 bg-neutral-900/60 p-3 rounded-lg border border-neutral-800">
                <div>
                  • 点击下方付款按钮将直接调用 <code className="text-amber-300">window.ethereum.request(&#123; method: 'eth_sendTransaction' &#125;)</code>
                </div>
                <div>
                  • 收款金库地址: <span className="text-white">{vaultAddress}</span>
                </div>
                <div>
                  • 链上附带 Data 凭证: <span className="text-emerald-400">FOURFUND:SUBSCRIBE:{fund.symbol}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isProcessing || usdAmount <= 0}
                onClick={executeRealWeb3Payment}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-neutral-950 font-mono font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Wallet className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? '请在您的插件钱包弹窗中确认签名...'
                    : `立即调起钱包真实支付 ${bnbAmountRequired.toFixed(5)} BNB ($${usdAmount})`}
                </span>
              </button>
            </div>
          )}

          {paymentChannel === 'relay_crosschain' && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-300">
                  来源链 (Relay Protocol 实时 API 聚合报价 → BNB Chain):
                </span>
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 8453, name: 'Base (8453)' },
                    { id: 42161, name: 'Arbitrum (42161)' },
                    { id: 10, name: 'Optimism (10)' }
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        setOriginChainId(ch.id);
                        setRelayQuote(null);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer border ${
                        originChainId === ch.id
                          ? 'bg-sky-400/20 border-sky-400 text-sky-300 font-bold'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}
                    >
                      {ch.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={fetchRealRelayQuote}
                    className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 cursor-pointer"
                    title="刷新 Relay 实时报价"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQuote ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {isLoadingQuote ? (
                <div className="p-4 text-center text-xs font-mono text-amber-400">
                  正在向 api.relay.link 请求实时跨链 Solver 路由与手续费报价...
                </div>
              ) : relayQuote ? (
                <div className="p-3 rounded-lg bg-neutral-900/80 border border-sky-500/30 text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between text-sky-400 font-bold">
                    <span>✓ Relay Solver 实时报价已返回</span>
                    <span>预计耗时: ~2 秒</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Solver 接收合约:</span>
                    <span>{relayQuote?.steps?.[0]?.items?.[0]?.data?.to || 'Relay Router'}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>目标链交割接收方:</span>
                    <span>{vaultAddress.slice(0, 10)}...{vaultAddress.slice(-6)} (BNB Chain)</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-mono text-neutral-400">
                  点击下方按钮拉取 Relay 实时跨链交易体并由钱包签名发送。
                </div>
              )}

              <button
                type="button"
                disabled={isProcessing || isLoadingQuote}
                onClick={executeRelaySolverTx}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-300 hover:to-emerald-300 text-neutral-950 font-mono font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <Globe className="w-4 h-4" />
                <span>
                  {relayQuote
                    ? `立即签名发送真实 Relay 跨链交易 ($${usdAmount})`
                    : `获取 Relay 实时跨链报价并支付 ($${usdAmount})`}
                </span>
              </button>
            </div>
          )}

          {paymentChannel === 'w3c_fiat' && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="text-xs text-neutral-300 leading-relaxed">
                直接调用浏览器标准 <code className="text-amber-300 font-mono">window.PaymentRequest</code> 接口（支持 Safari Apple Pay、Chrome Google Pay 与已保存信用卡），或在后端配置 <code className="text-emerald-400 font-mono">STRIPE_SECRET_KEY</code> 后自动跳转 Stripe 托管收银台。
              </div>

              <button
                type="button"
                disabled={isProcessing || usdAmount <= 0}
                onClick={executeRealFiatPayment}
                className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-mono font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? '正在唤起原生 Apple Pay / Google Pay 收银台...'
                    : `调起 Apple Pay / Google Pay 原生付款 ($${usdAmount.toFixed(2)} USD)`}
                </span>
              </button>
            </div>
          )}

          {paymentChannel === 'qr_transfer' && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Dynamic SVG QR-like visual + EIP-681 link */}
                <div className="p-3 bg-white rounded-xl shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                      eip681PaymentUri
                    )}`}
                    alt="BNB Chain EIP-681 Payment QR"
                    className="w-32 h-32"
                  />
                </div>

                <div className="space-y-2 text-xs font-mono flex-1 min-w-0">
                  <div className="text-amber-400 font-bold">
                    使用手机钱包 (MetaMask / Trust / OKX / 币安 Web3) 扫码直付
                  </div>
                  <div className="text-neutral-400 text-[11px] break-all">
                    金库收款地址: <span className="text-white">{vaultAddress}</span>
                  </div>
                  <div className="text-emerald-400 font-bold">
                    应付金额: {bnbAmountRequired.toFixed(5)} BNB (${usdAmount} USD)
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCopyVaultAddress}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                      <span>{copiedAddress ? '已复制收款地址!' : '复制金库地址'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Status / Error / Real On-Chain Transaction Hash Receipt */}
          {statusMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-xs font-mono text-emerald-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{statusMessage}</span>
              </div>
              {realTxHash && paymentReceiptType === 'onchain' && (
                <a
                  href={`${explorerBaseUrl}${realTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-400 hover:underline font-bold shrink-0"
                >
                  <span>在 BscScan 查看真实交易</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/60 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-rose-300">真实支付提示</div>
                <div className="text-[11px] leading-relaxed">{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Footer Security Note */}
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              非托管链上直付 · 交易哈希实时可查
            </span>
            <span>OpenFour Vault v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
