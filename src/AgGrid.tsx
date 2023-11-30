import { useCallback, type FC } from 'react'

import { useRetoolEventCallback, useRetoolState } from '@tryretool/custom-component-collections'
import { CellClickedEvent } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

export const AgGrid: FC = () => {
  const [rowData] = useRetoolState('rowData', [])
  const [columnDefs] = useRetoolState('columnDefs', [])
  const [_, setSelectedData] = useRetoolState('selectedData', '')

  const innerOnCellClicked = useRetoolEventCallback('cellClicked')

  const onCellClicked = useCallback(
    (event: CellClickedEvent) => {
      setSelectedData(event.data)
      innerOnCellClicked(event)
    },
    [innerOnCellClicked, setSelectedData],
  )

  return (
    <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
      <AgGridReact rowData={rowData} columnDefs={columnDefs} onCellClicked={onCellClicked}></AgGridReact>
    </div>
  )
}