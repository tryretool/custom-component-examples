import { useCallback, type FC, useRef, useEffect } from 'react'
import { IHighlight, NewHighlight, PdfHighlighter, PdfLoader } from 'react-pdf-highlighter'
import { v4 as uuidV4 } from 'uuid'
import { Tip, Highlight, Popup, AreaHighlight } from 'react-pdf-highlighter'
import { Retool } from '@tryretool/custom-component-support'
import { isLeft } from 'fp-ts/lib/Either'
import * as t from 'io-ts'

const HighlightPopup = ({ comment }: { comment: { text: string; emoji: string } }) =>
  comment.text ? (
    <div className="Highlight__popup">
      {comment.emoji} {comment.text}
    </div>
  ) : null

export const ReactPdfHighlighter: FC = () => {
  const [pdfUrl] = Retool.useStateString({ name: 'pdfUrl' })
  const [highlightsUnparsed, setHighlights] = Retool.useStateArray({ name: 'highlights', inspector: 'hidden' })

  Retool.useComponentSettings({
    defaultHeight: 30,
    defaultWidth: 5,
  })

  const validation = highlightCodecs.decode(highlightsUnparsed)

  // If we can't decode the highlights state, then we just set there to be no highlights.
  // If we wanted, we could display an error instead.
  const highlights = isLeft(validation) ? new Array<IHighlight>() : validation.right

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
      setHighlights(newHighlights)
      onHighlightsChanged()
    },
    [onHighlightsChanged, setHighlights],
  )

  const updateHighlight = (highlightId: string, position: Object, content: Object) => {
    console.log('Updating highlight', highlightId, position, content)
    const newHighlights = highlights.map((h) => {
      const { id, position: originalPosition, content: originalContent, ...rest } = h
      return id === highlightId
        ? {
            id,
            position: { ...originalPosition, ...position },
            content: { ...originalContent, ...content },
            ...rest,
          }
        : h
    })
    setHighlights(newHighlights)

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

const scaledType = t.intersection([
  t.type({
    x1: t.number,
    y1: t.number,
    x2: t.number,
    y2: t.number,
    width: t.number,
    height: t.number,
  }),
  t.partial({
    pageNumber: t.number,
  }),
])

const highlightCodecs = t.array(
  t.type({
    id: t.string,
    position: t.intersection([
      t.type({
        boundingRect: scaledType,
        rects: t.array(scaledType),
        pageNumber: t.number,
      }),
      t.partial({
        usePdfCoordinates: t.boolean,
      }),
    ]),
    content: t.partial({
      text: t.string,
      image: t.string,
    }),
    comment: t.type({
      text: t.string,
      emoji: t.string,
    }),
  }),
)
