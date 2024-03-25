import { useCallback, type FC, useRef, useEffect } from 'react'
import { IHighlight, NewHighlight, PdfHighlighter, PdfLoader } from 'react-pdf-highlighter'
import { v4 as uuidV4 } from 'uuid'
import { Tip, Highlight, Popup, AreaHighlight } from 'react-pdf-highlighter'
import { Retool } from '@tryretool/custom-component-support'

const HighlightPopup = ({ comment }: { comment: { text: string; emoji: string } }) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null

export const ReactPdfHighlighter: FC = () => {
  const [pdfUrl] = Retool.useStateString({ name: 'pdfUrl' })
  const [highlights, setHighlights] = Retool.useStateArray({ name: 'highlights' })

  const onHighlightsChanged = Retool.useEventCallback({ name: 'highlightsChanged' })

  const highlightsRef = useRef(highlights)

  // Update highlightsRef when highlights change
  // This is needed because the callback passed to PdfHighlighter
  // is a closure and won't be updated when the highlights state changes
  useEffect(() => {
    highlightsRef.current = highlights
  }, [highlights])

  const addHighlight = useCallback(
    (highlight: NewHighlight) => {
      const newHighlights = [...highlightsRef.current, { ...highlight, id: uuidV4() }]
      setHighlights(newHighlights as Retool.SerializableArray)
      onHighlightsChanged()
    },
    [onHighlightsChanged, setHighlights],
  )

  const updateHighlight = (highlightId: string, position: Object, content: Object) => {
    console.log('Updating highlight', highlightId, position, content)
    const newHighlights = highlights.map((h) => {
      h = h as Retool.SerializableObject
      const { id, position: originalPosition, content: originalContent, ...rest } = h
      return id === highlightId
        ? {
            id,
            position: { ...(originalPosition as Retool.SerializableObject), ...position },
            content: { ...(originalContent as Retool.SerializableObject), ...content },
            ...rest,
          }
        : (h as Retool.SerializableObject)
    })
    setHighlights(newHighlights as Retool.SerializableArray)

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
            highlights={highlights as unknown as IHighlight[]}
          />
        )}
      </PdfLoader>
    </div>
  )
}
