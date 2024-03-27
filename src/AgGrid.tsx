import { useCallback, type FC } from 'react'

import { Retool } from '@tryretool/custom-component-support'
import { CellClickedEvent } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

export const AgGrid: FC = () => {
  const [rowData] = Retool.useStateArray({
    name: 'rowData',
    initialValue: [
      {
        make: 'Toyota',
        model: 'Celica',
        price: 35000,
      },
      {
        make: 'Ford',
        model: 'Mondeo',
        price: 32000,
      },
      {
        make: 'Porsche',
        model: 'Boxster',
        price: 72000,
      },
    ],
  })

  const [columnDefs] = Retool.useStateArray({
    name: 'columnDefs',
    initialValue: [
      {
        headerName: 'Make',
        field: 'make',
      },
      {
        headerName: 'Model',
        field: 'model',
      },
      {
        headerName: 'Price',
        field: 'price',
      },
    ],
  })

  Retool.useComponentSettings({
    defaultHeight: 30,
    defaultWidth: 5,
  })

  const [_, setSelectedData] = Retool.useStateString({ name: 'selectedData', inspector: 'hidden' })

  const innerOnCellClicked = Retool.useEventCallback({ name: 'cellClicked' })

  const onCellClicked = useCallback(
    (event: CellClickedEvent) => {
      setSelectedData(event.data)
      innerOnCellClicked()
    },
    [innerOnCellClicked, setSelectedData],
  )

  return (
    <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
      <AgGridReact rowData={rowData} columnDefs={columnDefs as any} onCellClicked={onCellClicked}></AgGridReact>
    </div>
  )
}
