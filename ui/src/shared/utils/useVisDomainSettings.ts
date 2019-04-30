// Libraries
import {useMemo} from 'react'
import {extent} from 'd3-array'

// Utils
import {useOneWayState} from 'src/shared/utils/useOneWayState'
import {parseBounds} from 'src/shared/utils/vis'

// Types
import {Axis} from 'src/types'

/*
  This hook helps map the `bounds` setting stored for line graph to the
  appropriate settings on a @influxdata/vis `Config` object. 

  If the bounds setting is present, it should be used. If the bounds setting is
  not present, then the min/max values shown should be derived from the data
  passed to the plot.
*/
export const useVisDomainSettings = (
  bounds: Axis['bounds'],
  data: number[]
) => {
  const initialDomain = useMemo(() => {
    const suppliedDomain = parseBounds(bounds)

    if (suppliedDomain) {
      return suppliedDomain
    } else {
      return extent(data)
    }
  }, [bounds, data])

  const [domain, setDomain] = useOneWayState(initialDomain)
  const resetDomain = () => setDomain(initialDomain)

  return [domain, setDomain, resetDomain]
}
