// Libraries
import React, {PureComponent, CSSProperties} from 'react'

// Components
import GraphLoadingDots from 'src/shared/components/GraphLoadingDots'

// Types
import {RemoteDataState} from 'src/types'

interface Props {
  loading: RemoteDataState
  children: JSX.Element
}

class DygraphCell extends PureComponent<Props> {
  public render() {
    const {loading} = this.props
    return (
      <div className="dygraph graph--hasYLabel" style={this.style}>
        {loading === RemoteDataState.Loading && <GraphLoadingDots />}
        {this.props.children}
      </div>
    )
  }

  private get style(): CSSProperties {
    return {height: '100%'}
  }
}

export default DygraphCell
