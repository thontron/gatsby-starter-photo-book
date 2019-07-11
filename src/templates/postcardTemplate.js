import React from "react"
import { Helmet } from "react-helmet"
import { Link, navigate } from "gatsby"
import theme from "../theme.yaml"
import { FaTimesCircle, FaArrowLeft, FaArrowRight, FaExpand, FaCompress, FaDownload } from 'react-icons/fa';
import { GlobalStateContext } from "../components/globalState.js"
import { CornerCaseHandler } from "../components/cornerCaseHandler.js"
import { enterFullScreen, exitFullScreen } from "../util/fullScreenHelpers.js"
import { FlashCue } from "../components/flashCue.js"

class PostcardTemplate extends React.Component {

  constructor(props) {
    super(props)

    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.fullScreenChangeHandler = this.fullScreenChangeHandler.bind(this)
    this.enterFullScreenAndRender = this.enterFullScreenAndRender.bind(this)
    this.exitFullScreenAndRender = this.exitFullScreenAndRender.bind(this)
    this.currentImageLoaded = this.currentImageLoaded.bind(this)
    this.nextImageLoaded = this.nextImageLoaded.bind(this)
    this.prevImageLoaded = this.prevImageLoaded.bind(this)
    this.getStatePassForNext = this.getStatePassForNext.bind(this)
    this.getStatePassForPrev = this.getStatePassForPrev.bind(this)

    /* Magic numbers. */
    this.placeholderTransitionDuration = 1000
    this.zIndexes = this.zIndexes()

    this.state = {
      currentImageLoaded: this.getFromPassedStateOrDefault("currentImageLoaded", false),
      replacePlaceholderWith: this.getFromPassedStateOrDefault("replacePlaceholderWith", false),
      isFullScreen: this.getFromPassedStateOrDefault("isFullScreen", false),
      nextImageLoaded: this.getFromPassedStateOrDefault("nextImageLoaded", false),
      prevImageLoaded: this.getFromPassedStateOrDefault("prevImageLoaded", false)
    }
  }

  getFromPassedStateOrDefault(key, defaultVal = false) {
    if (!this.props.location || !this.props.location.state || !this.props.location.state[key]) return defaultVal
    return this.props.location.state[key]
  }

  zIndexes() {
    /* Doing it like this to reduce hidden dependencies. */
    const z = {}
    var next = 1
    z["prefetchedImages"] = next++
    z["currentImagePlaceholder"] = next++
    z["currentImage"] = next++
    z["flashCue"] = next++
    z["invisibleLinks"] = next++
    z["navButtons"] = next++
    return z
  }

  enterFullScreenAndRender() {
    enterFullScreen()
    this.setState({
      /* Re-render with the correct toggle icon. */
      isFullScreen: true
    })
  }

  exitFullScreenAndRender() {
    exitFullScreen()
    this.setState({
      /* Re-render with the correct toggle icon. */
      isFullScreen: false
    })
  }

  fullScreenChangeHandler() {
    /* This exists to detect changes in full screen initiated with browser functions (as opposed to our fullscreen icon). */
    if (!document) return
    if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
      this.exitFullScreenAndRender()
    } else {
      this.enterFullScreenAndRender()
    }
  }

  handleKeyDown = (event) => {
    if (event.keyCode === 37) {
      /* Left arrow. */
      navigate(`/images/${this.props.pageContext.prevId}`, { state: this.getStatePassForPrev() })
    } else if (event.keyCode === 39) {
      /* Right arrow. */
      navigate(`/images/${this.props.pageContext.nextId}`, { state: this.getStatePassForNext() })
    }
  }

  componentDidMount() {
    /* Keyboard listener for arrow key navigation. */
    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener("keydown", this.handleKeyDown)
    }

    /* Fullscreen change listener to detect when user presses ESC to exit fullscreen. */
    if (typeof document !== 'undefined' && document.addEventListener) {
      document.addEventListener('webkitfullscreenchange', this.fullScreenChangeHandler, false);
      document.addEventListener('mozfullscreenchange', this.fullScreenChangeHandler, false);
      document.addEventListener('fullscreenchange', this.fullScreenChangeHandler, false);
      document.addEventListener('MSFullscreenChange', this.fullScreenChangeHandler, false);
    }
  }

  currentImageLoaded() {
    /* Trigger re-render, start possible transition. */
    this.setState({
      currentImageLoaded: true
    })
  }

  nextImageLoaded() {
    this.setState({
      nextImageLoaded: true
    })
  }

  prevImageLoaded() {
    this.setState({
      prevImageLoaded: true
    })
  }

  componentWillUnmount() {
    if (this.timer1) {
      clearTimeout(this.timer1)
    }
    if (this.timer2) {
      clearTimeout(this.timer2)
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener("keydown", this.handleKeyDown)
      document.removeEventListener('webkitfullscreenchange', this.fullScreenChangeHandler, false);
      document.removeEventListener('mozfullscreenchange', this.fullScreenChangeHandler, false);
      document.removeEventListener('fullscreenchange', this.fullScreenChangeHandler, false);
      document.removeEventListener('MSFullscreenChange', this.fullScreenChangeHandler, false);
    }
  }

  getStatePassForNext() {
    return {
      isFullScreen: this.state.isFullScreen,
      currentImageLoaded: this.state.nextImageLoaded,
      replacePlaceholderWith: (this.state.nextImageLoaded ? this.props.pageContext.image.fluid : false),
      prevImageLoaded: this.state.currentImageLoaded
    }
  }

  getStatePassForPrev() {
    return {
      isFullScreen: this.state.isFullScreen,
      currentImageLoaded: this.state.prevImageLoaded,
      replacePlaceholderWith: (this.state.prevImageLoaded ? this.props.pageContext.image.fluid : false),
      nextImageLoaded: this.state.currentImageLoaded
    }
  }

  render () {
    const c = this.props.pageContext

    return (
      <>
        <Helmet>
          <meta charSet="utf-8" />
          <title>{`Photo ${c.image.id}`}</title>
          
          <style>
            {/* 
                Set some CSS attributes into html and body tags of this page.
                We do this here because a Gatsby bug prevents us from doing it the clean way
                (which would be: using separate CSS files for setting separate html/body attributes to different pages).
            */}
            {`
              html {
                height: 100%;
                overflow-y: hidden !important;
                overflow-x: hidden !important;
              }
              body {
                height: 100%;
                background-color: #fcf7e9;
                margin: 0 0 0 0;
                background-image: url("data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M81.28 88H68.413l19.298 19.298L81.28 88zm2.107 0h13.226L90 107.838 83.387 88zm15.334 0h12.866l-19.298 19.298L98.72 88zm-32.927-2.207L73.586 78h32.827l.5.5 7.294 7.293L115.414 87l-24.707 24.707-.707.707L64.586 87l1.207-1.207zm2.62.207L74 80.414 79.586 86H68.414zm16 0L90 80.414 95.586 86H84.414zm16 0L106 80.414 111.586 86h-11.172zm-8-6h11.173L98 85.586 92.414 80zM82 85.586L87.586 80H76.414L82 85.586zM17.414 0L.707 16.707 0 17.414V0h17.414zM4.28 0L0 12.838V0h4.28zm10.306 0L2.288 12.298 6.388 0h8.198zM180 17.414L162.586 0H180v17.414zM165.414 0l12.298 12.298L173.612 0h-8.198zM180 12.838L175.72 0H180v12.838zM0 163h16.413l.5.5 7.294 7.293L25.414 172l-8 8H0v-17zm0 10h6.613l-2.334 7H0v-7zm14.586 7l7-7H8.72l-2.333 7h8.2zM0 165.414L5.586 171H0v-5.586zM10.414 171L16 165.414 21.586 171H10.414zm-8-6h11.172L8 170.586 2.414 165zM180 163h-16.413l-7.794 7.793-1.207 1.207 8 8H180v-17zm-14.586 17l-7-7h12.865l2.333 7h-8.2zM180 173h-6.613l2.334 7H180v-7zm-21.586-2l5.586-5.586 5.586 5.586h-11.172zM180 165.414L174.414 171H180v-5.586zm-8 5.172l5.586-5.586h-11.172l5.586 5.586zM152.933 25.653l1.414 1.414-33.94 33.942-1.416-1.416 33.943-33.94zm1.414 127.28l-1.414 1.414-33.942-33.94 1.416-1.416 33.94 33.943zm-127.28 1.414l-1.414-1.414 33.94-33.942 1.416 1.416-33.943 33.94zm-1.414-127.28l1.414-1.414 33.942 33.94-1.416 1.416-33.94-33.943zM0 85c2.21 0 4 1.79 4 4s-1.79 4-4 4v-8zm180 0c-2.21 0-4 1.79-4 4s1.79 4 4 4v-8zM94 0c0 2.21-1.79 4-4 4s-4-1.79-4-4h8zm0 180c0-2.21-1.79-4-4-4s-4 1.79-4 4h8z' fill='%239C92AC' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E");
              }
              * {
                -webkit-tap-highlight-color: transparent !important;
                outline: none !important;
              }
            `}
          </style>
        </Helmet>
        <GlobalStateContext.Consumer>
          {globalState => (
              <>
                  <CornerCaseHandler g={globalState} currId={c.image.id} nextId={c.nextId} />

                  {/* Invisible helper links for prev/next navigation: clicking left side of the viewport links to prev, right side to next. */}
                  <Link to={`/images/${c.prevId}`} state={this.getStatePassForPrev()} title={c.image.title} >
                        <span style={{ position: "fixed", height: "100%", width: "50%", left: "0px", zIndex: this.zIndexes["invisibleLinks"] }}></span>
                  </Link>
                  <Link to={`/images/${c.nextId}`} state={this.getStatePassForNext()} title={c.image.title} >
                        <span style={{ position: "fixed", height: "100%", width: "50%", right: "0px", zIndex: this.zIndexes["invisibleLinks"] }}></span>
                  </Link>

                  {/* Navbuttons: prev/next (even though clicking anywhere on the page works, we want to help the user understand what they can do). */}
                  <Link to={`/images/${c.prevId}`} state={this.getStatePassForPrev()} >
                    <FaArrowLeft className="arrowButtons" style={{ left: "10px", top: "50%", transform: "translateY(-50%)" }} title="Previous image" />
                  </Link>
                  <Link to={`/images/${c.nextId}`} state={this.getStatePassForNext()} >
                    <FaArrowRight className="arrowButtons" style={{ right: "10px", top: "50%", transform: "translateY(-50%)" }} title="Next image" />
                  </Link>

                  {/* Flash cues for small screens instead of sticking prev/next buttons. */}
                  <FlashCue g={globalState} additionalWait={this.placeholderTransitionDuration} zIndex={this.zIndexes["flashCue"]} />

                  {/* Navbutton: Top right 'x' to 'close' the image and return to gallery. */}
                  <span className="x">
                    <Link to={`/#id${c.image.id}`} state={{ highlight: c.image.id }} title="Back to Gallery" >
                      <FaTimesCircle style={{ right: "10px", top: "10px" }} />
                    </Link>
                  </span>

                  {/* Navbutton: Fullscreen toggle. */}
                  <span className="fullscreen">
                    {this.state.isFullScreen && (
                      <FaCompress style={{ right: "10px", bottom: "10px", cursor: "pointer" }} title="Exit full screen mode" onClick={this.exitFullScreenAndRender} />
                    )}
                    {!this.state.isFullScreen && (
                      <FaExpand style={{ right: "10px", bottom: "10px", cursor: "pointer" }} title="Enter full screen mode" onClick={this.enterFullScreenAndRender} />
                    )}
                  </span>

                  {/* Navbutton: Download image. */}
                  <span className="download">
                    <a href={c.image.fluid.originalImg} download >
                      <FaDownload style={{ right: "80px", bottom: "12px" }} title="Download image" />
                    </a>
                  </span>

                  {/* Display current image. */}
                  <img
                    className={`decoratedImage ${this.state.currentImageLoaded ? "fade-in" : "hide"}`}
                    src={c.image.fluid.originalImg}
                    srcSet={c.image.fluid.srcSet}
                    sizes={c.image.fluid.sizes}
                    alt=""
                    title={c.image.title}
                    importance="high" /* Resource prioritization hint. */
                    style={{ zIndex: this.zIndexes["currentImage"] }}
                    onLoad={this.currentImageLoaded}
                  />

                  {/* If current image is not ready, display placeholder until current image has loaded, then transition. */}
                  {!this.state.replacePlaceholderWith && (
                    <img
                      className={`currentImagePlaceholder ${this.state.currentImageLoaded ? "fade-out" : ""}`}
                      src={c.image.fluid.tracedSVG}
                      alt=""
                      style={{ zIndex: this.zIndexes["currentImagePlaceholder"], height: "1337%", borderRadius: "0px" }}
                    />
                  )}

                  {/* Preload adjacent images (hide with CSS).
                    * Why like this, and not with link rel prefetch?
                    * 1. link rel prefetch sometimes eats bandwidth from current image.
                    * 2. link rel prefetch can not be used with srcSet. */}
                  {this.state.currentImageLoaded && (
                    <>
                      <img
                        className="prefetchedImages"
                        src={c.prefetchNext1.originalImg}
                        srcSet={c.prefetchNext1.srcSet}
                        sizes={c.prefetchNext1.sizes}
                        alt=""
                        importance="low"
                        onLoad={this.nextImageLoaded}
                      />
                      <img
                        className="prefetchedImages"
                        src={c.prefetchPrev.originalImg}
                        srcSet={c.prefetchPrev.srcSet}
                        sizes={c.prefetchPrev.sizes}
                        alt=""
                        importance="low"
                        onLoad={this.prevImageLoaded}
                      />
                      <img
                        className="prefetchedImages"
                        src={c.prefetchNext2.originalImg}
                        srcSet={c.prefetchNext2.srcSet}
                        sizes={c.prefetchNext2.sizes}
                        alt=""
                        importance="low"
                      />
                    </>
                  )}

                  <style jsx>
                    {`

                        img {
                          position: absolute;
                          margin-left: auto;
                          margin-right: auto;
                          margin-top: auto;
                          margin-bottom: auto;
                          padding: 0;

                          left: 5%;
                          right: 5%;
                          top: 3%;
                          bottom: 3%;
                          max-height: 94%;
                          max-width: 90%;

                          @media only screen and (max-width: 1200px) {
                            left: 0px;
                            right: 0px;
                            top: 0px;
                            bottom: 0px;
                            max-height: 100%;
                            max-width: 100%;

                            -webkit-box-shadow: 0 0 0 0 !important;
                            -moz-box-shadow: 0 0 0 0 !important;
                            box-shadow: 0 0 0 0 !important;
                          }

                        }

                        .decoratedImage {
                          -webkit-box-shadow: 1vw 1vh 5vh 0px rgba(0,0,0,0.75);
                          -moz-box-shadow: 1vw 1vh 5vh 0px rgba(0,0,0,0.75);
                          box-shadow: 1vw 1vh 5vh 0px rgba(0,0,0,0.75);
                          border-radius: 8px;
                        }

                        .hide {
                          opacity: 0;
                        }

                        .fade-in {
                          opacity: 1;
                          transition: ${this.placeholderTransitionDuration}ms ease-in;
                        }

                        .fade-out {
                          opacity: 0;
                          transition: ${this.placeholderTransitionDuration}ms step-end;
                        }

                        .prefetchedImages {
                          opacity: 0;
                          z-index: ${this.zIndexes["prefetchedImages"]}
                        }

                        :global(.arrowButtons) {
                          @media only screen and (max-width: 1200px) {
                            visibility: hidden;
                          }
                        }

                        :global(svg) {
                          position: fixed;
                          font-size: 40px;
                          fill: ${theme.color.brand.primary};
                          opacity: 0.5;
                          z-index: ${this.zIndexes["navButtons"]}
                        }

                        :global(svg):hover {
                          opacity: 1;
                        }
                        
                    `}
                  </style>
              </>
        )}</GlobalStateContext.Consumer>
      </>
    )
  }
}


export default PostcardTemplate
