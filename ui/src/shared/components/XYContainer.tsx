// Libraries
import {get} from 'lodash'
import React, {FunctionComponent, useMemo} from 'react'
import {Config, fluxToTable} from '@influxdata/vis'

// Components
import EmptyGraphMessage from 'src/shared/components/EmptyGraphMessage'
import GraphLoadingDots from 'src/shared/components/GraphLoadingDots'

// Utils
import {useVisDomainSettings} from 'src/shared/utils/useVisDomainSettings'
import {
  formatNumber,
  resolveGeom,
  filterNoisyColumns,
} from 'src/shared/utils/vis'

// Constants
import {VIS_THEME} from 'src/shared/constants'
import {DEFAULT_LINE_COLORS} from 'src/shared/constants/graphColorPalettes'
import {INVALID_DATA_COPY} from 'src/shared/copy/cell'

// Types
import {RemoteDataState, XYView, XYViewGeom} from 'src/types'

// Eventually these will be configurable in the line graph options UI
const X_COLUMN = '_time'
const Y_COLUMN = '_value'

interface Props {
  files: string[]
  loading: RemoteDataState
  viewProperties: XYView
  children: (config: Config) => JSX.Element
}

const XYContainer: FunctionComponent<Props> = ({
  files,
  loading,
  children,
  viewProperties: {
    geom,
    colors,
    axes: {
      x: {label: xAxisLabel, bounds: xBounds},
      y: {
        label: yAxisLabel,
        prefix: yTickPrefix,
        suffix: yTickSuffix,
        bounds: yBounds,
      },
    },
  },
}) => {
  const {table, fluxGroupKeyUnion} = useMemo(
    () => fluxToTable(files.join('\n\n')),
    [files]
  )

  const [xDomain, onSetXDomain, onResetXDomain] = useVisDomainSettings(
    xBounds,
    get(table, ['columns', X_COLUMN, 'data'], [])
  )

  const [yDomain, onSetYDomain, onResetYDomain] = useVisDomainSettings(
    yBounds,
    get(table, ['columns', Y_COLUMN, 'data'], [])
  )

  if (!table.columns[X_COLUMN] || !table.columns[Y_COLUMN]) {
    return <EmptyGraphMessage message={INVALID_DATA_COPY} />
  }

  const colorHexes =
    colors && colors.length
      ? colors.map(c => c.hex)
      : DEFAULT_LINE_COLORS.map(c => c.hex)

  const interpolation =
    resolveGeom(geom) === XYViewGeom.Step ? 'step' : 'monotoneX'

  const groupKey = [...fluxGroupKeyUnion, 'result']

  const legendColumns = filterNoisyColumns(
    [...groupKey, X_COLUMN, Y_COLUMN],
    table
  )

  const config: Config = {
    ...VIS_THEME,
    table,
    xAxisLabel,
    yAxisLabel,
    yTickFormatter: t => `${yTickPrefix}${formatNumber(t)}${yTickSuffix}`,
    xDomain,
    onSetXDomain,
    onResetXDomain,
    yDomain,
    onSetYDomain,
    onResetYDomain,
    legendColumns,
    layers: [
      {
        type: 'line',
        x: X_COLUMN,
        y: Y_COLUMN,
        fill: groupKey,
        interpolation,
        colors: colorHexes,
      },
    ],
  }

  return (
    <div className="xy-container">
      {loading === RemoteDataState.Loading && <GraphLoadingDots />}
      {children(config)}
    </div>
  )
}

export default React.memo(XYContainer)
