import { faAngleLeft, faAngleRight, faSort, faSortDown, faSortUp, faSync, faTrash, faDownload, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap';
import { nanoid } from 'nanoid';
import React, { useCallback, useEffect, useRef } from 'react';
import ReactPaginate from 'react-paginate';
import inputForm from '../../helpers/toaster/form/inputForm';
import showError from '../../helpers/toaster/message/showError';
import showSuccess from '../../helpers/toaster/message/showSuccess';
import { AnimationModel, GalleryAnimationFilter } from './animation/model';
import { useGallery } from './Provider';
import { StyledGallery } from './Styled';

const createjs = (window as any)['createjs'];

type GalleryAnimationRendererProps = {
  animation: AnimationModel;
};

const GalleryAnimationRenderer: React.FC<GalleryAnimationRendererProps> = ({
  animation, 
}) => {
  const animationContainer = useRef<HTMLDivElement>(null);
  const domOverlayContainer = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const init = () => {
    const AdobeAn = (window as any)['AdobeAn'];
    if (!AdobeAn) {
      return;
    }

    const comp=AdobeAn.getComposition("6D2E871EEB804D1693D8876BED1198AB");
    let lib=comp.getLibrary();
    const loader = new createjs.LoadQueue(false);
    loader.addEventListener("fileload", function(evt: any){handleFileLoad(evt,comp)});
    loader.addEventListener("complete", function(evt: any){handleComplete(evt,comp)});
    lib=comp.getLibrary();
    lib.properties.manifest.forEach((image: {src: string, id: string}) => {
      if (image.src.includes(animation.pngName)) {
        image.src = animation.pngUrl;
      }
    });

    loader.loadManifest([{
      src:"http://localhost:8700/v0/b/ani-canvas-598e9.appspot.com/o/local%2FaniCanvas%2Fgalleries%2FTxFovKhBGBgvfE7BB9uxduSgikrI%2Fannimations%2FfRTpvIKgiGa-QbqsxIUYS%2Fpng%2F_HTML5%20Canvas_atlas_1.png?alt=media&token=739af34c-0b76-43d5-b16b-295a8934618a", id:"_HTML5 Canvas_atlas_1"
    }]);
  }

  const handleFileLoad = (evt: any, comp: any) => {
    const images=comp.getImages();	
    if (evt && (evt.item.type === "image")) { images[evt.item.id] = evt.result; }	
  }

  //Registers the "tick" event listener.
  const fnStartAnimation = (stage: any, exportRoot: any, lib: any) => {
    stage.addChild(exportRoot);
    createjs.Ticker.framerate = lib.properties.fps;
    createjs.Ticker.addEventListener("tick", stage);
  }

  const handleComplete = (evt: any, comp: any) => {
    if (!canvasRef?.current || !animationContainer?.current || !domOverlayContainer?.current) {
      return;
    }

    const AdobeAn = (window as any)['AdobeAn'];

    //This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
    const lib=comp.getLibrary();
    const ss=comp.getSpriteSheet();
    const queue = evt.target;
    const ssMetadata = lib.ssMetadata;
    for(let i=0; i<ssMetadata.length; i++) {
      ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames} )
    }
    const exportRoot = new lib._HTML5Canvas();
    const stage = new lib.Stage(canvasRef.current);
    stage.enableMouseOver();	

    //Code to support hidpi screens and responsive scaling.
    // AdobeAn.makeResponsive(false,'both',false,1,[canvasRef.current,animationContainer.current,domOverlayContainer.current]);
    AdobeAn.compositionLoaded(lib.properties.id);
    fnStartAnimation(stage, exportRoot, lib);
  }

  useEffect(() => {
    const script = document.createElement('script');
    script.src = animation.jsUrl;
    script.async = true;
    script.onload = () => init();
  
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);

  return (
    <>
      {animation?.jsUrl && animation?.pngUrl ? (
        <div ref={animationContainer}
          className='position-relative bg-white'
          style={{ width: '100%', aspectRatio: '4/3' }}
        >
          <canvas id="canvas" width="437" height="617"
            className='position-absolute bg-white'
            style={{ width: '100%', aspectRatio: '4/3', objectFit: 'contain' }}
            ref={canvasRef}>
          </canvas>
          <div ref={domOverlayContainer}
            className='position-absolute'
            style={{ width: '100%', aspectRatio: '4/3', pointerEvents: 'none' }}
          >
          </div>
        </div>
      ):(
        <img
          style={{
            objectFit: 'contain', width: '100%', height: '100%',
            boxShadow: '0 10px 25px 0 rgba(0, 0, 0, .5)'
          }}
          src={animation.gifUrl}
          alt={animation.name}
        ></img>
      )}
    </>
  );
}

type Props = {};

const GalleryRenderer: React.FC<Props> = () => {
  const {
    thisUser,
    userName,
    isLoading,
    animationsPageLast,
    galleryAnimations,
    galleryAnimationFilter,
    uploadAnimation,
    removeAnimation,
    setAnimationsPageCurrent,
    setGalleryAnimationFilter,
  } = useGallery();

  const filterIconMap: any = {
    NONE: (<FontAwesomeIcon icon={faSort} className='ms-2'/>),
    DESCENDING: (<FontAwesomeIcon icon={faSortDown} className='ms-2'/>),
    ASCENDING: (<FontAwesomeIcon icon={faSortUp} className='ms-2'/>),
  }

  const dropDirection = 'down';
  const dropMenualine = 'right';

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.download = fileName;
    a.href = fileUrl;
    a.click();
    a.remove();
  }

  const handleUploadAnimation = useCallback(async () => {
    const res = await inputForm(
      {
        title: 'Upload Animation',
        confirmButtonText: 'Confirm',
      },
      {
        gifFile: {label: '.gif File', value: '', type: 'file', fileType: 'image/gif'},
        flaFile: {label: '.fla File', value: '', type: 'file'},
        jsFile: {label: '.js File', value: '', type: 'file', fileType: 'application/javascript'},
        pngFile: {label: '.png File', value: '', type: 'file', fileType: 'image/png'},
      }
    )

    if (res?.value) {
      const { gifFile, flaFile, jsFile, pngFile } = res.value;

      if (!gifFile) {
        showError({
          title: 'Upload Animation',
          text: 'Please Select .gif File',
          timer: 0,
        });
        return;
      }

      if (!flaFile) {
        showError({
          title: 'Upload Animation',
          text: 'Please Select .fla File',
          timer: 0,
        });
        return;
      }

      const newAnimation = new AnimationModel({
        id: nanoid(),
        name: gifFile.name
      });

      try {
        await uploadAnimation(
          Object.assign({}, newAnimation),
          gifFile,
          flaFile,
          jsFile,
          pngFile,
        );

        showSuccess({
          title: 'Upload Animation Success',
          text: 'Animation Uploaded!',
          timer: 1000,
        });
      } catch (error: any) {
        showError({
          title: 'Upload Animation Error',
          text: error.message,
          timer: 0,
        });
      }
    }
  }, [uploadAnimation]);

  const handleRemoveAnimation = useCallback(async (animation: AnimationModel) => {
    const res = await inputForm(
      {
        title: 'Remove Animation',
        confirmButtonText: 'Confirm',
      },
      {
        message: {label: '', value: 'Are you Sure?', type: 'label'}
      }
    )

    if (res?.isConfirmed) {
      try {
        await removeAnimation(Object.assign({}, animation));
        showSuccess({
          title: 'Remove Animation',
          text: 'Animation Removed!',
          timer: 1000,
        });
      } catch (error: any) {
        showError({
          title: 'Remove Animation Error',
          text: error.message,
          timer: 0,
        });
      }
    }
  }, [removeAnimation]);

  return (
    <StyledGallery>
      <div className='container p-2 d-flex flex-row'>
        <div className='me-auto my-auto'>
          <span
            className='text-center me-2'
            onClick={() => {
              let userFilter = Object.assign({}, galleryAnimationFilter) as GalleryAnimationFilter;
              userFilter.createdAt = userFilter.createdAt === 'NONE' ? 'ASCENDING'
                : userFilter.createdAt === 'ASCENDING' ? 'DESCENDING'
                : 'NONE';
              setGalleryAnimationFilter(userFilter);
            }}
          >
            CreatedAt
            {filterIconMap[galleryAnimationFilter.createdAt]}
          </span>
          <span
            className='text-center me-2'
            onClick={() => {
              let userFilter = Object.assign({}, galleryAnimationFilter) as GalleryAnimationFilter;
              userFilter.name = userFilter.name === 'NONE' ? 'ASCENDING'
                : userFilter.name === 'ASCENDING' ? 'DESCENDING'
                : 'NONE';
              setGalleryAnimationFilter(userFilter);
            }}
          >
            Name
            {filterIconMap[galleryAnimationFilter.name]}
          </span>
        </div>

        <ReactPaginate
          previousLabel={<FontAwesomeIcon icon={faAngleLeft} className='me-3' />}
          nextLabel={<FontAwesomeIcon icon={faAngleRight} className='ms-3' />}
          breakLabel={'...'}
          breakClassName={'break-me'}
          pageCount={animationsPageLast}
          marginPagesDisplayed={1}
          pageRangeDisplayed={3}
          onPageChange={(data: any) => setAnimationsPageCurrent(data.selected)}
          containerClassName={'pagination'}
          activeClassName={'active'}
        />

        {thisUser?.name === userName ? (
          <div className='ms-auto my-auto'>
            <button
              className='btn btn-outline-primary'
              onClick={handleUploadAnimation}
            >Upload Animation</button>
          </div>
        ):(<></>)}
      </div>

      {isLoading ? (
        <div
          className='position-absolute d-flex'
          style={{left: 0, right: 0, top: 0, bottom: 0}}
        >
          <div className='m-auto'>
            <FontAwesomeIcon
              spin
              icon={faSync}
              className='fs-1'
            />
          </div>
        </div>
      ) : (<></>)}
        
      {!isLoading && galleryAnimations.length === 0 ? (
        <div className='container p-2 d-flex flex-column'>
          <div className='alert alert-secondary text-center fs-3' role='alert'>
            No Animation
          </div>
        </div>
      ):(
        <div className='container p-2 d-flex flex-column'>
          <div className='row'>
            {galleryAnimations.map((animation) => {
              return (
                <div
                  key={animation.id}
                  className='m-auto'
                  style={{ width: '33.3%', height: '33.3%'}}
                >
                  <div className='d-flex' style={{ width: '100%'}}>
                    <span className='me-auto text-dark text-break fs-5 my-2 ms-2'>
                      {animation.name}
                    </span>

                    <DropdownButton
                      menuAlign={dropMenualine}
                      as={ButtonGroup}
                      key={dropDirection}
                      id={`dropdown-button-drop-${dropDirection}`}
                      className={'dropdown-buttons ms-auto my-2 me-2'}
                      size='sm'
                      drop={dropDirection}
                      variant=''
                      title={<FontAwesomeIcon icon={faEllipsisV}/>}
                    >
                      {thisUser?.name === userName ? (
                        <Dropdown.Item
                          eventKey='0'
                          onClick={() => handleRemoveAnimation(animation)}
                        >
                          <FontAwesomeIcon icon={faTrash} className='me-2'/>
                          Remove
                        </Dropdown.Item>
                      ):(<></>)}

                      <Dropdown.Item
                        eventKey='1'
                        onClick={() => handleDownloadFile(animation.gifUrl, animation.gifName)}
                      >
                        <FontAwesomeIcon icon={faDownload} className='me-2'/>
                        {animation.gifName}
                      </Dropdown.Item>

                      <Dropdown.Item
                        eventKey='2'
                        onClick={() => handleDownloadFile(animation.flaUrl, animation.flaName)}
                      >
                        <FontAwesomeIcon icon={faDownload} className='me-2'/>
                        {animation.flaName}
                      </Dropdown.Item>

                      {animation?.jsName && animation?.pngName ? (
                        <>
                          <Dropdown.Item
                            eventKey='3'
                            onClick={() => handleDownloadFile(animation.jsUrl, animation.jsName)}
                          >
                            <FontAwesomeIcon icon={faDownload} className='me-2'/>
                            {animation.jsName}
                          </Dropdown.Item>

                          <Dropdown.Item
                            eventKey='4'
                            onClick={() => handleDownloadFile(animation.pngUrl, animation.pngName)}
                          >
                            <FontAwesomeIcon icon={faDownload} className='me-2'/>
                            {animation.pngName}
                          </Dropdown.Item>
                        </>
                      ):(<></>)}
                    </DropdownButton>
                  </div>

                  <GalleryAnimationRenderer animation={animation}></GalleryAnimationRenderer>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </StyledGallery>
  )
}

export default GalleryRenderer;
