import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, TrendingDown, Pencil, Check, RefreshCw, Download } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { RAW_DATA, PAGES, METRICS } from './constants';
import { MetricCell } from './components/MetricCell';
import { MetricKey, Dataset } from './types';
import { InlineInput } from './components/InlineInput';

// Configuration for each metric type to handle units and scaling
const METRIC_CONFIG: Record<string, { label: string; unit: string; maxValue: number; lowerIsBetter: boolean; variant: 'chart' | 'text' }> = {
  Performance: { label: 'Performance', unit: '', maxValue: 100, lowerIsBetter: false, variant: 'chart' },
  Accessibility: { label: 'Accessibility', unit: '', maxValue: 100, lowerIsBetter: false, variant: 'chart' },
  BestPractices: { label: 'Best Practices', unit: '', maxValue: 100, lowerIsBetter: false, variant: 'chart' },
  SEO: { label: 'SEO', unit: '', maxValue: 100, lowerIsBetter: false, variant: 'chart' },
  LCP: { label: 'LCP', unit: 's', maxValue: 6.0, lowerIsBetter: true, variant: 'text' },
  TBT: { label: 'TBT', unit: 'ms', maxValue: 600, lowerIsBetter: true, variant: 'text' },
  INP: { label: 'INP', unit: 'ms', maxValue: 500, lowerIsBetter: true, variant: 'text' },
  LoadTime: { label: 'Load Time', unit: 's', maxValue: 10.0, lowerIsBetter: true, variant: 'text' },
};

const App: React.FC = () => {
  // -- State --
  const [gridData, setGridData] = useState<Dataset>(RAW_DATA);
  const [labels, setLabels] = useState({ start: 'June', end: 'July' });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // State for units to allow editing
  const [metricUnits, setMetricUnits] = useState<Record<string, string>>(() => {
    const initialUnits: Record<string, string> = {};
    METRICS.forEach(m => {
      initialUnits[m] = METRIC_CONFIG[m].unit;
    });
    return initialUnits;
  });

  // Ref for the element we want to download
  const downloadRef = useRef<HTMLDivElement>(null);

  // -- Load data from DB on mount --
  useEffect(() => {
    fetch('/api/get-data')
      .then(res => res.json())
      .then(data => {
        if (data.gridData) setGridData(data.gridData);
        if (data.labels) setLabels(data.labels);
        if (data.metricUnits) setMetricUnits(data.metricUnits);
      })
      .catch(() => {
        // Falls back to RAW_DATA already set as default state
      })
      .finally(() => setIsLoaded(true));
  }, []);

  // -- Save to DB whenever data changes --
  useEffect(() => {
    if (!isLoaded) return;

    setIsSaving(true);
    fetch('/api/save-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gridData, labels, metricUnits }),
    }).finally(() => setIsSaving(false));
  }, [gridData, labels, metricUnits, isLoaded]);

  // -- Logic --
  const handleUpdateData = (page: string, metric: string, key: 'June' | 'July', value: number) => {
    setGridData(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [metric]: {
          ...prev[page][metric as MetricKey],
          [key]: value
        }
      }
    }));
  };

  const handleUnitUpdate = (metric: string, newUnit: string) => {
    setMetricUnits(prev => ({
      ...prev,
      [metric]: newUnit
    }));
  };

  const handleDownload = useCallback(() => {
    if (downloadRef.current === null) {
      return;
    }

    const node = downloadRef.current;
    const width = node.scrollWidth;
    const height = node.scrollHeight;

    setTimeout(() => {
      toJpeg(node, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        width: width,
        height: height,
        pixelRatio: 3,
        style: {
          overflow: 'visible',
          maxHeight: 'none',
          maxWidth: 'none',
        }
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'web-vitals-scorecard.jpeg';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('Error generating image', err);
        });
    }, 100);
  }, [downloadRef]);

  // Calculate high-level stats
  const insights = useMemo(() => {
    let maxImprovement = { page: '', metric: '', value: -Infinity, displayValue: '' };
    let maxRegression = { page: '', metric: '', value: Infinity, displayValue: '' };
    let totalScoreStart = 0;
    let totalScoreEnd = 0;
    let count = 0;

    PAGES.forEach(page => {
      METRICS.forEach(metric => {
        const mKey = metric as MetricKey;
        const config = METRIC_CONFIG[metric] || METRIC_CONFIG.Performance;
        const currentUnit = metricUnits[metric];
        const mData = gridData[page][mKey];
        const startVal = mData.June;
        const endVal = mData.July;

        let diff = endVal - startVal;
        let improvementScore = config.lowerIsBetter ? -diff : diff;

        if (config.maxValue === 100 && !config.lowerIsBetter) {
          totalScoreStart += startVal;
          totalScoreEnd += endVal;
          count++;
        }

        if (improvementScore > maxImprovement.value) {
          maxImprovement = {
            page,
            metric: config.label,
            value: improvementScore,
            displayValue: `${diff > 0 ? '+' : ''}${diff.toFixed(currentUnit === 's' ? 1 : 0)}${currentUnit}`
          };
        }

        if (improvementScore < maxRegression.value) {
          maxRegression = {
            page,
            metric: config.label,
            value: improvementScore,
            displayValue: `${diff > 0 ? '+' : ''}${diff.toFixed(currentUnit === 's' ? 1 : 0)}${currentUnit}`
          };
        }
      });
    });

    const avgStart = count > 0 ? Math.round(totalScoreStart / count) : 0;
    const avgEnd = count > 0 ? Math.round(totalScoreEnd / count) : 0;
    const avgDiff = avgEnd - avgStart;

    return { maxImprovement, maxRegression, avgStart, avgEnd, avgDiff };
  }, [gridData, metricUnits]);

  const toggleEdit = () => setIsEditing(!isEditing);
  const resetData = () => {
    if (window.confirm("Reset all data to default?")) {
      setGridData(RAW_DATA);
      setLabels({ start: 'June', end: 'July' });
      const initialUnits: Record<string, string> = {};
      METRICS.forEach(m => {
        initialUnits[m] = METRIC_CONFIG[m].unit;
      });
      setMetricUnits(initialUnits);
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex flex-col font-sans">

      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 shrink-0 z-10 sticky top-0">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200 transition-transform hover:scale-105">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Core Vitals Scorecard</h1>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                Performance Overview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Global Score */}
            <div className="flex flex-col items-end border-r border-slate-100 pr-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Overall Score</span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-slate-800">{insights.avgEnd}</span>
                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${insights.avgDiff >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {insights.avgDiff > 0 ? '+' : ''}{insights.avgDiff}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              {isSaving && (
                <span className="text-xs text-slate-400 animate-pulse">Saving...</span>
              )}
              {isEditing && (
                <button
                  onClick={resetData}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                  title="Reset Data"
                >
                  <RefreshCw size={18} />
                </button>
              )}
              <button
                onClick={handleDownload}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                title="Download Chart"
              >
                <Download size={18} />
              </button>
              <button
                onClick={toggleEdit}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isEditing
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isEditing ? <><Check size={14} /> Done</> : <><Pencil size={14} /> Edit</>}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Scorecard Grid */}
      <main className="flex-1 p-6 max-w-[1800px] mx-auto w-full flex flex-col overflow-hidden">
        <div className="w-full overflow-x-auto pb-6">
          <div
            ref={downloadRef}
            className="grid grid-cols-[180px_repeat(4,minmax(140px,1fr))_repeat(4,minmax(100px,1fr))] auto-rows-auto border-t border-l border-slate-300 rounded-xl overflow-hidden shadow-sm min-w-[1200px]"
          >
            {/* -- Internal Title Row -- */}
            <div className="col-span-full bg-white px-6 py-3 border-r border-b border-slate-300 flex items-center">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mr-1">Comparison:</span>
                    <InlineInput
                      value={labels.start}
                      onChange={(v) => setLabels(prev => ({ ...prev, start: v }))}
                      className="bg-white border-b border-indigo-300 w-[60px] text-center text-sm font-bold text-indigo-900"
                    />
                    <span className="text-slate-400 font-medium text-sm">vs</span>
                    <InlineInput
                      value={labels.end}
                      onChange={(v) => setLabels(prev => ({ ...prev, end: v }))}
                      className="bg-white border-b border-indigo-300 w-[60px] text-center text-sm font-bold text-indigo-900"
                    />
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Comparison:</span>
                    <span className="text-indigo-900 font-bold">{labels.start}</span>
                    <span className="text-slate-300">→</span>
                    <span className="text-indigo-900 font-bold">{labels.end}</span>
                  </div>
                )}
              </div>
            </div>

            {/* -- Column Headers -- */}
            <div className="bg-slate-50 flex flex-col justify-end p-4 border-r border-b border-slate-300">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Page Name</span>
            </div>

            {METRICS.map((metric, index) => {
              const config = METRIC_CONFIG[metric];
              const isCoreVital = index >= 4;
              const currentUnit = metricUnits[metric];

              return (
                <div key={metric} className={`bg-slate-50 py-4 px-2 flex flex-col justify-end text-center border-r border-b border-slate-300 ${isCoreVital ? 'bg-slate-50/50' : ''}`}>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider leading-tight">{config.label}</span>
                  <div className="text-[10px] text-slate-400 font-medium mt-1 flex justify-center items-center h-4">
                    {isEditing ? (
                      <div className="flex items-center bg-white border border-slate-300 rounded px-1">
                        <span className="mr-0.5 text-slate-300">(</span>
                        <InlineInput
                          value={currentUnit}
                          onChange={(val) => handleUnitUpdate(metric, val)}
                          className="w-8 text-center bg-transparent p-0 text-[9px]"
                          placeholder="unit"
                        />
                        <span className="ml-0.5 text-slate-300">)</span>
                      </div>
                    ) : (
                      <span>{currentUnit ? `(${currentUnit})` : config.maxValue === 100 ? '(0-100)' : ''}</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* -- Data Rows (Pages) -- */}
            {PAGES.map((page) => (
              <React.Fragment key={page}>
                <div className="bg-white px-6 py-4 flex items-center border-r border-b border-slate-300 group">
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">{page}</h3>
                </div>

                {METRICS.map((metric, index) => {
                  const config = METRIC_CONFIG[metric] || METRIC_CONFIG.Performance;
                  const data = gridData[page][metric as MetricKey];
                  const isCoreVital = index >= 4;
                  const currentUnit = metricUnits[metric];

                  return (
                    <div
                      key={`${page}-${metric}`}
                      className={`bg-white hover:bg-slate-50 transition-colors duration-200 relative border-r border-b border-slate-300`}
                    >
                      <MetricCell
                        previousValue={data.June}
                        currentValue={data.July}
                        isEditing={isEditing}
                        unit={currentUnit}
                        maxValue={config.maxValue}
                        lowerIsBetter={config.lowerIsBetter}
                        variant={config.variant}
                        onUpdate={(prev, curr) => {
                          handleUpdateData(page, metric, 'June', prev);
                          handleUpdateData(page, metric, 'July', curr);
                        }}
                      />
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;