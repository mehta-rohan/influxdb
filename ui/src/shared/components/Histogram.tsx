// Libraries
import React, {useMemo, useCallback, FunctionComponent} from 'react'
import {Plot, Config, Table} from '@influxdata/vis'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'

// Utils
import {useOneWayState} from 'src/shared/utils/useOneWayState'
import {formatNumber} from 'src/shared/utils/vis'

// Constants
import {INVALID_DATA_COPY} from 'src/shared/copy/cell'
import {VIS_THEME} from 'src/shared/constants'

// Types
import {HistogramView} from 'src/types/dashboards'

interface Props {
  table: Table
  properties: HistogramView
}

const Histogram: FunctionComponent<Props> = ({
  table,
  properties: {
    xColumn,
    fillColumns,
    binCount,
    position,
    colors,
    xAxisLabel,
    xDomain: defaultXDomain,
  },
}) => {
  const [xDomain, onSetXDomain] = useOneWayState(defaultXDomain)

  const onResetXDomain = useCallback(() => onSetXDomain(defaultXDomain), [
    defaultXDomain,
    onSetXDomain,
  ])

  const colorHexes = useMemo(() => colors.map(c => c.hex), [colors])

  const isValidView =
    xColumn &&
    table.columns[xColumn] &&
    fillColumns.every(col => !!table.columns[col])

  if (!isValidView) {
    return <EmptyGraphMessage message={INVALID_DATA_COPY} />
  }

  const config: Config = useMemo(
    () => ({
      ...VIS_THEME,
      table,
      xDomain,
      onSetXDomain,
      onResetXDomain,
      xAxisLabel,
      xTickFormatter: formatNumber,
      layers: [
        {
          type: 'histogram' as 'histogram',
          x: xColumn,
          fill: fillColumns,
          binCount,
          position,
          colors: colorHexes,
        },
      ],
    }),
    [
      table,
      xDomain,
      onSetXDomain,
      onResetXDomain,
      xAxisLabel,
      xColumn,
      fillColumns,
      binCount,
      position,
      colorHexes,
    ]
  )

  return (
    <div className="histogram-container">
      <Plot config={config} />
    </div>
  )
}

export default Histogram
