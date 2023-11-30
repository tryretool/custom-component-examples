import { useRetoolEventCallback, useRetoolState } from '@tryretool/custom-component-collections'
import { useCallback, type FC, useRef, useEffect } from 'react'
import { IHighlight, NewHighlight, PdfHighlighter, PdfLoader } from 'react-pdf-highlighter'
import { v4 as uuidV4 } from 'uuid'
import { Tip, Highlight, Popup, AreaHighlight } from 'react-pdf-highlighter'

const HighlightPopup = ({ comment }: { comment: { text: string; emoji: string } }) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null

export const ReactPdfHighlighter: FC = () => {
  const [pdfUrl] = useRetoolState('pdfUrl', '')
  const [highlights, setHighlights] = useRetoolState<IHighlight[]>('highlights', [])

  const onHighlightsChanged = useRetoolEventCallback('highlightsChanged')

  const highlightsRef = useRef<IHighlight[]>(highlights)

  // Update highlightsRef when highlights change
  // This is needed because the callback passed to PdfHighlighter
  // is a closure and won't be updated when the highlights state changes
  useEffect(() => {
    highlightsRef.current = highlights
  }, [highlights])

  const addHighlight = useCallback(
    (highlight: NewHighlight) => {
      const newHighlights = [...highlightsRef.current, { ...highlight, id: uuidV4() }]
      setHighlights(newHighlights)
      onHighlightsChanged()
    },
    [onHighlightsChanged, setHighlights],
  )

  const updateHighlight = (highlightId: string, position: Object, content: Object) => {
    console.log('Updating highlight', highlightId, position, content)

    setHighlights(
      highlights.map((h) => {
        const { id, position: originalPosition, content: originalContent, ...rest } = h
        return id === highlightId
          ? {
              id,
              position: { ...originalPosition, ...position },
              content: { ...originalContent, ...content },
              ...rest,
            }
          : h
      }),
    )

    onHighlightsChanged()
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <PdfLoader url={pdfUrl} beforeLoad={<div>Loading...</div>}>
        {(pdfDocument) => (
          <PdfHighlighter
            pdfDocument={pdfDocument}
            enableAreaSelection={(event) => event.altKey}
            onScrollChange={() => {
              console.log('Scrolling to ')
            }}
            scrollRef={(scrollTo) => {
              console.log('Scrolling to ', scrollTo)
            }}
            onSelectionFinished={(position, content, hideTipAndSelection, transformSelection) => (
              <Tip
                onOpen={transformSelection}
                onConfirm={(comment) => {
                  addHighlight({ content, position, comment })
                  hideTipAndSelection()
                }}
              />
            )}
            highlightTransform={(highlight, index, setTip, hideTip, viewportToScaled, screenshot, isScrolledTo) => {
              const isTextHighlight = !Boolean(highlight.content && highlight.content.image)

              const component = isTextHighlight ? (
                <Highlight isScrolledTo={isScrolledTo} position={highlight.position} comment={highlight.comment} />
              ) : (
                <AreaHighlight
                  isScrolledTo={isScrolledTo}
                  highlight={highlight}
                  onChange={(boundingRect) => {
                    updateHighlight(
                      highlight.id,
                      { boundingRect: viewportToScaled(boundingRect) },
                      { image: screenshot(boundingRect) },
                    )
                  }}
                />
              )

              return (
                <Popup
                  popupContent={<HighlightPopup {...highlight} />}
                  onMouseOver={(popupContent) => setTip(highlight, (highlight) => popupContent)}
                  onMouseOut={hideTip}
                  key={index}
                  children={component}
                />
              )
            }}
            highlights={highlights}
          />
        )}
      </PdfLoader>
    </div>
  )
}