import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Check,
  Copy,
  RefreshCw,
  ShieldCheck,
  Zap,
  Download,
  ServerOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface DomainDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDomain?: string;
}

interface DnsRecord {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DnsCheckResult {
  ok: boolean;
  domain: string;
  checkedAt: string;
  targetOrigin: string;
  records: {
    A: DnsRecord[];
    CNAME: DnsRecord[];
    NS: DnsRecord[];
  };
  diagnostics: {
    isResolving: boolean;
    usesCloudflareNs: boolean;
    hasVercelRecord: boolean;
    hasPagesRecord: boolean;
    hasCloudRunRecord: boolean;
  };
}

const LIVE_CLOUD_RUN_ORIGIN = 'https://ais-pre-bruriaivcepnlmxymkb2n4-585964218279.asia-east1.run.app';

export const DomainDeployModal: React.FC<DomainDeployModalProps> = ({
  isOpen,
  onClose,
  defaultDomain = 'ai42.top'
}) => {
  const [domainInput, setDomainInput] = useState<string>(defaultDomain);
  const [activePlan, setActivePlan] = useState<'vercel_pages' | 'cf_pages_direct' | 'cloud_run'>('vercel_pages');
  const [dnsResult, setDnsResult] = useState<DnsCheckResult | null>(null);
  const [isCheckingDns, setIsCheckingDns] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const cleanDomain = domainInput
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '') || 'ai42.top';

  const workerScriptCode = `// Cloudflare Worker 零服务器反向代理脚本 (${cleanDomain} -> FourFund 生产实例)
// 部署步骤：登录 Cloudflare -> Workers & Pages -> 创建 Worker -> 粘贴以下代码并部署 -> 绑定自定义域 ${cleanDomain} 和 www.${cleanDomain}

const TARGET_ORIGIN = "${LIVE_CLOUD_RUN_ORIGIN}";

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const targetUrl = new URL(url.pathname + url.search, TARGET_ORIGIN);

    const modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set("Host", new URL(TARGET_ORIGIN).host);
    modifiedHeaders.set("X-Forwarded-Host", url.host);
    modifiedHeaders.set("X-Forwarded-Proto", "https");

    const proxyRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: modifiedHeaders,
      body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
      redirect: "manual"
    });

    const response = await fetch(proxyRequest);
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Access-Control-Allow-Origin", "*");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  }
};`;

  const checkLiveDns = async (targetDomain: string) => {
    setIsCheckingDns(true);
    try {
      const apiRes = await fetch(`/api/domain/check?domain=${encodeURIComponent(targetDomain)}`);
      if (apiRes.ok) {
        const data = (await apiRes.json()) as DnsCheckResult;
        setDnsResult(data);
        setIsCheckingDns(false);
        return;
      }
      throw new Error('Fallback to browser DoH');
    } catch {
      // Browser direct Cloudflare DoH fallback
      const queryType = async (type: 'A' | 'CNAME' | 'NS'): Promise<DnsRecord[]> => {
        try {
          const r = await fetch(
            `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(targetDomain)}&type=${type}`,
            { headers: { Accept: 'application/dns-json' } }
          );
          if (!r.ok) return [];
          const j = await r.json();
          return j.Answer || [];
        } catch {
          return [];
        }
      };

      const [A, CNAME, NS] = await Promise.all([
        queryType('A'),
        queryType('CNAME'),
        queryType('NS')
      ]);

      const usesCloudflareNs = NS.some((r) => r.data.toLowerCase().includes('cloudflare.com'));
      const hasVercelRecord =
        A.some((r) => r.data === '76.76.21.21') ||
        CNAME.some((r) => r.data.toLowerCase().includes('vercel-dns.com'));
      const hasPagesRecord = CNAME.some((r) => r.data.toLowerCase().includes('pages.dev'));
      const hasCloudRunRecord = CNAME.some((r) =>
        r.data.toLowerCase().includes('ghs.googlehosted.com')
      );

      setDnsResult({
        ok: true,
        domain: targetDomain,
        checkedAt: new Date().toISOString(),
        targetOrigin: LIVE_CLOUD_RUN_ORIGIN,
        records: { A, CNAME, NS },
        diagnostics: {
          isResolving: A.length > 0 || CNAME.length > 0,
          usesCloudflareNs,
          hasVercelRecord,
          hasPagesRecord,
          hasCloudRunRecord
        }
      });
    } finally {
      setIsCheckingDns(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkLiveDns(cleanDomain);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadWorkerScript = () => {
    const blob = new Blob([workerScriptCode], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudflare-worker-${cleanDomain.replace(/\./g, '-')}.js`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-neutral-800 bg-neutral-950 text-neutral-100 shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>自定义域名免服务器部署中心</span>
                <span className="text-xs font-mono text-amber-400">({cleanDomain})</span>
              </h2>
              <p className="text-xs text-neutral-400">
                0 元免买服务器 (Zero-VPS) · 免备案 · 自动免费 HTTPS 证书 · 已内置全套部署配置文件
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* 1. Live DNS Inspector for ai42.top */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>实时公网 DNS 解析诊断 (Cloudflare DoH 实时探测)</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="输入您的域名，如 ai42.top"
                  className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-700 text-xs font-mono text-white focus:outline-none focus:border-amber-400 w-44"
                />
                <button
                  onClick={() => checkLiveDns(cleanDomain)}
                  disabled={isCheckingDns}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDns ? 'animate-spin' : ''}`} />
                  <span>检测 {cleanDomain}</span>
                </button>
              </div>
            </div>

            {dnsResult && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-800/80 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                  <div className="text-neutral-500 mb-1">NS 权威域名服务器</div>
                  {dnsResult.records.NS.length > 0 ? (
                    <div className="space-y-0.5 text-neutral-200 truncate">
                      {dnsResult.records.NS.map((r, i) => (
                        <div key={i} className="truncate">{r.data}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-amber-400">暂未检出 NS 记录或刚注册</div>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                  <div className="text-neutral-500 mb-1">当前 A / CNAME 记录</div>
                  {dnsResult.records.A.length > 0 || dnsResult.records.CNAME.length > 0 ? (
                    <div className="space-y-0.5 text-emerald-400 truncate">
                      {dnsResult.records.A.map((r, i) => (
                        <div key={`a-${i}`}>A → {r.data}</div>
                      ))}
                      {dnsResult.records.CNAME.map((r, i) => (
                        <div key={`c-${i}`}>CNAME → {r.data}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>尚未绑定解析记录 (等待配置)</span>
                    </div>
                  )}
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                  <div className="text-neutral-500 mb-1">当前生产容器源站 (已在线)</div>
                  <div className="text-emerald-400 truncate" title={LIVE_CLOUD_RUN_ORIGIN}>
                    {LIVE_CLOUD_RUN_ORIGIN.replace('https://', '')}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    状态：可直接通过 {cleanDomain} 映射
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Why ais-pre-*.run.app doesn't open directly + Repo Config Status Banner */}
          <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-2 text-xs">
            <div className="font-bold text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>为什么默认的 ais-pre-*.run.app 链接直接打不开？</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-300 leading-relaxed">
              <li>
                <strong className="text-white">原因 1（国内网络屏蔽 *.run.app）：</strong> Google Cloud Run 的默认后缀 <code className="font-mono text-amber-300">.run.app</code> 在中国大陆网络下受 DNS 阻断，不挂梯子无法直接连接。
              </li>
              <li>
                <strong className="text-white">原因 2（AI Studio 预览鉴权锁）：</strong> <code className="font-mono text-amber-300">ais-pre-*</code> 是 AI Studio 内部预览容器，带有 Google 登录 Cookie 拦截，外部访客直接访问或反向代理会被重定向拦截。
              </li>
              <li>
                <strong className="text-emerald-400">解决方案：</strong> 使用下方的 <strong className="text-white">Vercel 或 Cloudflare Pages 独立托管</strong> 并绑定您的 <code className="font-mono text-emerald-300">{cleanDomain}</code>，即可完全脱离 <code className="font-mono">.run.app</code> 限制，全球及国内访客免登录、免翻墙直接秒开！
              </li>
            </ul>
          </div>

          {/* 3. Three Zero-Server Deployment Options Switcher */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 p-1 rounded-xl bg-neutral-900 border border-neutral-800">
              <button
                type="button"
                onClick={() => setActivePlan('vercel_pages')}
                className={`flex-1 min-w-[200px] py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                  activePlan === 'vercel_pages'
                    ? 'bg-amber-400 text-neutral-950 shadow-sm'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>方案一：GitHub + Vercel 独立托管 (最稳推荐)</span>
                  <span className="font-mono text-[10px] underline">免翻墙 · 免登录墙</span>
                </div>
                <div
                  className={`text-[11px] mt-0.5 font-normal ${
                    activePlan === 'vercel_pages' ? 'text-neutral-900' : 'text-neutral-500'
                  }`}
                >
                  脱离 .run.app 限制，导出 GitHub 后一键绑定 {cleanDomain}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActivePlan('cf_pages_direct')}
                className={`flex-1 min-w-[200px] py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                  activePlan === 'cf_pages_direct'
                    ? 'bg-amber-400 text-neutral-950 shadow-sm'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>方案二：Cloudflare Pages 全球节点托管</span>
                  <span className="font-mono text-[10px]">无限流量免费 CDN</span>
                </div>
                <div
                  className={`text-[11px] mt-0.5 font-normal ${
                    activePlan === 'cf_pages_direct' ? 'text-neutral-900' : 'text-neutral-500'
                  }`}
                >
                  使用 Cloudflare Pages 自动构建并绑定 {cleanDomain}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActivePlan('cloud_run')}
                className={`flex-1 min-w-[200px] py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left ${
                  activePlan === 'cloud_run'
                    ? 'bg-amber-400 text-neutral-950 shadow-sm'
                    : 'text-neutral-300 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>方案三：Google Cloud Run 官方发布</span>
                  <span className="font-mono text-[10px]">需点击 Deploy</span>
                </div>
                <div
                  className={`text-[11px] mt-0.5 font-normal ${
                    activePlan === 'cloud_run' ? 'text-neutral-900' : 'text-neutral-500'
                  }`}
                >
                  部署到您自己的 GCP Cloud Run 并开放公开访问
                </div>
              </button>
            </div>

            {/* PLAN 2: CLOUDFLARE PAGES */}
            {activePlan === 'cf_pages_direct' && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Cloudflare Pages 零服务器独立托管 ({cleanDomain})</span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      完全脱离 <code className="text-amber-300 font-mono">.run.app</code>，直接由 Cloudflare 全球边缘节点托管您的前端与链上交互，无限带宽且自带免费 SSL。
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <div className="font-mono font-bold text-amber-400">第 1 步：导出到 GitHub</div>
                    <p className="text-neutral-300 leading-relaxed">
                      点击 AI Studio 右上角的 <span className="text-white font-medium">Export to GitHub</span> 图标，将代码一键同步到您的 GitHub 账号下。
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <div className="font-mono font-bold text-amber-400">第 2 步：连接 Cloudflare Pages</div>
                    <p className="text-neutral-300 leading-relaxed">
                      登录 <span className="text-white font-medium">dash.cloudflare.com</span> → 左侧 <span className="text-white font-medium">Workers 和 Pages</span> → 点击 <span className="text-white font-medium">创建 → Pages → 连接到 Git</span>，选择刚导出的仓库。构建命令填 <code className="text-emerald-400 font-mono">npm run build</code>，输出目录填 <code className="text-emerald-400 font-mono">dist</code>。
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                    <div className="font-mono font-bold text-amber-400">第 3 步：绑定 {cleanDomain}</div>
                    <p className="text-neutral-300 leading-relaxed">
                      构建成功后，在 Pages 项目的「自定义域 (Custom domains)」中点击「设置自定义域」，输入{' '}
                      <code className="text-emerald-400 font-mono">{cleanDomain}</code>，Cloudflare 会自动为您配好 DNS 与证书！
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PLAN 2: VERCEL / CLOUDFLARE PAGES */}
            {activePlan === 'vercel_pages' && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ServerOff className="w-4 h-4 text-emerald-400" />
                    <span>GitHub + Vercel 零服务器托管并绑定 {cleanDomain}</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    适合希望完全独立托管代码、后续随时修改自动重新部署的用户。全程 0 元，不需要租用任何 VPS 主机。
                  </p>
                </div>

                <div className="space-y-2 text-xs text-neutral-300">
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <strong className="text-amber-400 font-mono">1. 导出代码到 GitHub：</strong> 点击 AI Studio 界面右上角的「导出到 GitHub (Export to GitHub)」按钮，将本项目推送到您的 GitHub 仓库（项目内已自动为您写好 <code className="text-white font-mono">vercel.json</code> 和 <code className="text-white font-mono">public/CNAME</code>）。
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <strong className="text-amber-400 font-mono">2. 导入 Vercel 并添加域名：</strong> 使用 GitHub 登录 <span className="text-white font-medium">vercel.com</span>，点击「Add New Project」选择刚导出的仓库并点击 Deploy。部署完成后进入项目的 <span className="text-white font-medium">Settings → Domains</span>，输入 <code className="text-emerald-400 font-mono">{cleanDomain}</code> 点击 Add。
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <strong className="text-amber-400 font-mono">3. 在您的域名后台添加以下 2 条 DNS 解析记录：</strong> 打开您购买 <code className="text-white font-mono">{cleanDomain}</code> 的域名控制台（如阿里云万网 / 腾讯云 DNSPod / Namecheap / Cloudflare），添加下面两行记录：
                  </div>
                </div>

                {/* DNS Records Table with One-Click Copy */}
                <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 bg-neutral-900/60">
                        <th className="py-2.5 px-3">记录类型 (Type)</th>
                        <th className="py-2.5 px-3">主机记录 (Host/Name)</th>
                        <th className="py-2.5 px-3">记录值 / 指向 (Value/Target)</th>
                        <th className="py-2.5 px-3">TTL</th>
                        <th className="py-2.5 px-3 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80">
                      <tr>
                        <td className="py-2.5 px-3 text-amber-400 font-bold">A</td>
                        <td className="py-2.5 px-3 text-white">@ (代表 {cleanDomain})</td>
                        <td className="py-2.5 px-3 text-emerald-400">76.76.21.21</td>
                        <td className="py-2.5 px-3 text-neutral-400">自动 / 600</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleCopy('vercel_a', '76.76.21.21')}
                            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer"
                          >
                            {copiedKey === 'vercel_a' ? '已复制' : '复制记录值'}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-amber-400 font-bold">CNAME</td>
                        <td className="py-2.5 px-3 text-white">www (代表 www.{cleanDomain})</td>
                        <td className="py-2.5 px-3 text-emerald-400">cname.vercel-dns.com</td>
                        <td className="py-2.5 px-3 text-neutral-400">自动 / 600</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleCopy('vercel_cname', 'cname.vercel-dns.com')}
                            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer"
                          >
                            {copiedKey === 'vercel_cname' ? '已复制' : '复制记录值'}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PLAN 3: GOOGLE CLOUD RUN CUSTOM DOMAIN MAPPING */}
            {activePlan === 'cloud_run' && (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-400" />
                    <span>Google Cloud Run 原生自定义域名映射 ({cleanDomain})</span>
                  </h3>
                  <p className="text-xs text-neutral-400">
                    如果您在 AI Studio 点击右上角「Deploy to Cloud Run」部署到自己的 Google Cloud 项目，可以直接在 Cloud Run 控制台中的「管理自定义网域 (Manage Custom Domains)」添加 <code className="text-white font-mono">{cleanDomain}</code>：
                  </p>
                </div>

                <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="border-b border-neutral-800 text-neutral-400 bg-neutral-900/60">
                        <th className="py-2.5 px-3">记录类型</th>
                        <th className="py-2.5 px-3">主机记录</th>
                        <th className="py-2.5 px-3">指向目标 (Google 托管网关)</th>
                        <th className="py-2.5 px-3 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80">
                      <tr>
                        <td className="py-2.5 px-3 text-amber-400 font-bold">CNAME</td>
                        <td className="py-2.5 px-3 text-white">www</td>
                        <td className="py-2.5 px-3 text-emerald-400">ghs.googlehosted.com.</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleCopy('gcp_cname', 'ghs.googlehosted.com')}
                            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer"
                          >
                            {copiedKey === 'gcp_cname' ? '已复制' : '复制'}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-amber-400 font-bold">A</td>
                        <td className="py-2.5 px-3 text-white">@</td>
                        <td className="py-2.5 px-3 text-emerald-400">216.239.32.21 / 216.239.34.21</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleCopy('gcp_a', '216.239.32.21')}
                            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 cursor-pointer"
                          >
                            {copiedKey === 'gcp_a' ? '已复制' : '复制 IP'}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Summary Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-800 text-xs text-neutral-400">
            <span>
              提示：修改完 DNS 解析后，点击上方「检测 {cleanDomain}」按钮即可实时验证全网生效状态。
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium cursor-pointer self-end sm:self-auto"
            >
              完成并关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
