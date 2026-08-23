import { Gauge, Heart, MapPin, PackageOpen } from "lucide-react"

import { ResourceStat } from "./resource-stat"

export function ResourceBar({ resources, capacities, bond, distance }: { resources: { fuel: number; credits: number }; capacities: { fuel: number }; bond: number; distance: number }) {
  return (
    <section className="border-b border-black/15 bg-[#eee9de] dark:border-white/10 dark:bg-[#202521]">
      <div className="mx-auto grid max-w-[120rem] grid-cols-2 divide-x divide-y divide-black/10 sm:grid-cols-3 sm:divide-y-0 lg:grid-cols-5 dark:divide-white/10">
        <ResourceStat icon={<Gauge />} label="Fuel" value={resources.fuel} max={capacities.fuel} tone="amber" />
        <ResourceStat icon={<PackageOpen />} label="Trade credits" value={resources.credits} tone="steel" />
        <ResourceStat icon={<Heart />} label="Family bond" value={bond} max={100} tone="red" />
        <ResourceStat icon={<MapPin />} label="Distance" value={distance} suffix=" km" tone="blue" />
      </div>
    </section>
  )
}
