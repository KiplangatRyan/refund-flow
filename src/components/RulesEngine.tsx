import React, { useState } from 'react';
import { AutoPolicyRule } from '../types/refund';
import { 
  Sliders, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  ToggleLeft, 
  ToggleRight, 
  Save, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  Percent 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RulesEngineProps {
  rules: AutoPolicyRule[];
  onUpdateRules: (updated: AutoPolicyRule[]) => void;
}

export const RulesEngine: React.FC<RulesEngineProps> = ({ rules, onUpdateRules }) => {
  const [localRules, setLocalRules] = useState<AutoPolicyRule[]>(rules);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleRule = (ruleId: string) => {
    const updated = localRules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
    setLocalRules(updated);
    setHasChanges(true);
  };

  const updateCondition = (ruleId: string, field: string, value: number) => {
    const updated = localRules.map(r => {
      if (r.id === ruleId) {
        return {
          ...r,
          conditions: {
            ...r.conditions,
            [field]: value
          }
        };
      }
      return r;
    });
    setLocalRules(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdateRules(localRules);
    setHasChanges(false);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Autonomous Policy Engine</h1>
          <p className="text-xs text-slate-500">
            Define programmatic criteria for automated instant approvals, restocking fees, and risk gating
          </p>
        </div>

        {hasChanges && (
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Apply Policy Updates</span>
          </button>
        )}
      </div>

      {/* Rules Grid */}
      <div className="space-y-4">
        {localRules.map((rule) => (
          <div
            key={rule.id}
            className={`p-5 rounded-xl border transition-all ${
              rule.enabled 
                ? 'bg-white border-slate-200 shadow-2xs' 
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  rule.enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'
                }`}>
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{rule.name}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      rule.enabled 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {rule.enabled ? 'Active Policy' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl">{rule.description}</p>
                </div>
              </div>

              {/* Toggle Button */}
              <button
                onClick={() => toggleRule(rule.id)}
                className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                title={rule.enabled ? 'Deactivate rule' : 'Activate rule'}
              >
                {rule.enabled ? (
                  <ToggleRight className="w-8 h-8 text-indigo-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-400" />
                )}
              </button>
            </div>

            {/* Condition Customization Controls */}
            {rule.enabled && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-700">
                {rule.conditions.maxAmount !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-500">Max Auto-Refund Amount:</span>
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-300">
                      <span className="font-mono text-slate-500">$</span>
                      <input
                        type="number"
                        value={rule.conditions.maxAmount}
                        onChange={(e) => updateCondition(rule.id, 'maxAmount', Number(e.target.value))}
                        className="w-16 bg-transparent font-mono font-bold text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {rule.conditions.maxFraudScore !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-500">Fraud Score Cap:</span>
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-300">
                      <input
                        type="number"
                        max="100"
                        min="1"
                        value={rule.conditions.maxFraudScore}
                        onChange={(e) => updateCondition(rule.id, 'maxFraudScore', Number(e.target.value))}
                        className="w-12 bg-transparent font-mono font-bold text-slate-900 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-500">/ 100</span>
                    </div>
                  </div>
                )}

                {rule.conditions.bonusPercent !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-500">Store Credit Bonus:</span>
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-300">
                      <input
                        type="number"
                        max="50"
                        min="0"
                        value={rule.conditions.bonusPercent}
                        onChange={(e) => updateCondition(rule.id, 'bonusPercent', Number(e.target.value))}
                        className="w-12 bg-transparent font-mono font-bold text-slate-900 focus:outline-none"
                      />
                      <span className="font-mono text-slate-500">%</span>
                    </div>
                  </div>
                )}

                {rule.conditions.daysSincePurchase !== undefined && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-500">Standard Return Window:</span>
                    <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded border border-slate-300">
                      <input
                        type="number"
                        value={rule.conditions.daysSincePurchase}
                        onChange={(e) => updateCondition(rule.id, 'daysSincePurchase', Number(e.target.value))}
                        className="w-12 bg-transparent font-mono font-bold text-slate-900 focus:outline-none"
                      />
                      <span className="text-slate-500">days</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
