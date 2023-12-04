import { useRetoolState } from '@tryretool/custom-component-collections'
import { useRef, type FC, useEffect } from 'react'
import * as TableauAPI from 'tableau-api-js'

export const Tableau: FC = () => {
  const ref = useRef(null)
  const [vizUrl, setVizUrl] = useRetoolState<string>(
    'vizUrl',
    'https://public.tableau.com/views/RadialMarimekko/RM',
  )

  useEffect(() => {

    if (ref.current !== undefined) {
      const viz = new TableauAPI.Viz(ref.current, vizUrl)
      return () => {
        viz.dispose()
      }
    }
  }, [ref.current, vizUrl])

  return <div ref={ref} style={{ width: '100%', height: '100%', margin: 'auto' }}></div>
}
