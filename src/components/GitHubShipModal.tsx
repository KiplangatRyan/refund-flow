import React, { useState } from 'react';
import { 
  Github, 
  X, 
  Copy, 
  Check, 
  Download, 
  GitBranch, 
  Terminal, 
  FileCode2, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateRepoZip } from '../utils/exportZip';

interface GitHubShipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubShipModal: React.FC<GitHubShipModalProps> = ({ isOpen, onClose }) => {
  const [repoUrl, setRepoUrl] = useState('https://github.com/kiplangatryan05/refund-flow.git');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cli' | 'git' | 'preview'>('cli');

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const blob = await generateRepoZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'refund-flow-repo.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Failed to generate zip', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const gitSnippet = `# 1. Add your remote repository
git remote add origin ${repoUrl}

# 2. Ensure main branch
git branch -M main

# 3. Push complete codebase to GitHub
git push -u origin main`;

  const ghCliSnippet = `# Fast 1-command GitHub repository creation & push:
gh repo create refund-flow --public --source=. --remote=origin --push`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Ship RefundFlow to GitHub</h2>
                <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Git Ready
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Push your complete Refund Flow app to a GitHub remote or export full source
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Target Repo Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              GitHub Repository Remote URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/refund-flow.git"
                className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => setRepoUrl('https://github.com/kiplangatryan05/refund-flow.git')}
                className="text-xs text-slate-500 hover:text-indigo-600 whitespace-nowrap px-2 py-1"
                title="Reset to default"
              >
                Reset
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Create a new repository on <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-0.5">GitHub <ExternalLink className="w-3 h-3" /></a> (public or private), then paste its URL above.
            </p>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveTab('cli')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'cli' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>GitHub CLI (Instant)</span>
            </button>
            <button
              onClick={() => setActiveTab('git')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'git' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Standard Git Commands</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PackageCheck className="w-3.5 h-3.5" />
              <span>Repository Manifest</span>
            </button>
          </div>

          {/* Tab 1: GitHub CLI */}
          {activeTab === 'cli' && (
            <div className="space-y-3">
              <div className="bg-slate-950 rounded-xl p-4 text-slate-100 font-mono text-xs relative group border border-slate-800">
                <button
                  onClick={() => handleCopy(ghCliSnippet, 1)}
                  className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans transition-colors"
                >
                  {copiedIndex === 1 ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Command</span>
                    </>
                  )}
                </button>
                <div className="text-slate-500 select-none pb-2"># If you have GitHub CLI installed (gh)</div>
                <div className="text-emerald-400 font-semibold select-all leading-relaxed whitespace-pre-wrap">
                  {ghCliSnippet}
                </div>
              </div>
              <p className="text-xs text-slate-600">
                This single command creates the GitHub repository under your profile, configures the remote, and pushes the code in seconds.
              </p>
            </div>
          )}

          {/* Tab 2: Standard Git */}
          {activeTab === 'git' && (
            <div className="space-y-3">
              <div className="bg-slate-950 rounded-xl p-4 text-slate-100 font-mono text-xs relative group border border-slate-800">
                <button
                  onClick={() => handleCopy(gitSnippet, 2)}
                  className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans transition-colors"
                >
                  {copiedIndex === 2 ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Snippet</span>
                    </>
                  )}
                </button>
                <pre className="text-slate-200 font-mono text-xs whitespace-pre-wrap leading-relaxed select-all">
                  {gitSnippet}
                </pre>
              </div>
              <p className="text-xs text-slate-600">
                Run these commands in your project root terminal. All files, commits, and GitHub CI actions are pre-committed.
              </p>
            </div>
          )}

          {/* Tab 3: Repository Manifest */}
          {activeTab === 'preview' && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800">Included Repository Artifacts:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>.github/workflows/ci.yml</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>.github/pull_request_template.md</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>README.md (Production Docs)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>LICENSE (MIT Open Source)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Full TypeScript & React Codebase</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Tailwind CSS v4 Configuration</span>
                </div>
              </div>
            </div>
          )}

          {/* Alternative: Direct Source ZIP Download */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-900">Prefer a standalone zip archive?</div>
              <div className="text-[11px] text-slate-500">Download all files, workflows, and configuration as a .zip</div>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300 w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Packaging Archive...' : 'Download Repository (.zip)'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ready for GitHub Actions CI and Cloud deployment</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
