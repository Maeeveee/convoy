export function ObjectiveProgress({ progress, target }: { progress: number; target: number }) {
  return <><div className="mt-3 h-1.5 bg-black/10 dark:bg-white/10 lg:mt-[12px] lg:h-[6px]"><div className="h-full bg-[#ad7c2c]" style={{ width: `${Math.min((progress / target) * 100, 100)}%` }} /></div><p className="mt-1 text-right font-mono text-xs tabular-nums lg:mt-[4px] lg:text-[12px]">{Math.floor(progress)} / {target}</p></>
}
