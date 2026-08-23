import { Button } from "@/components/ui/button"

export function ResetJourneyDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="presentation"><div role="alertdialog" aria-modal="true" aria-labelledby="reset-title" className="w-full max-w-sm border border-white/15 bg-[#202521] p-5 text-[#ebe5d7] shadow-2xl"><h2 id="reset-title" className="text-lg font-semibold">Reset this journey?</h2><p className="mt-2 text-sm leading-6 text-[#adb6ac]">All current resources, generators, distance, and vehicle upgrades will be erased.</p><div className="mt-5 flex justify-end gap-2"><Button variant="ghost" className="rounded-sm" onClick={onCancel}>Cancel</Button><Button variant="destructive" className="rounded-sm" onClick={onConfirm}>Reset journey</Button></div></div></div>
}
