import { faAngleLeft, faAngleRight, faSort, faSortDown, faSortUp, faSync, faTrash, faCheck, faDownload, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonGroup, Dropdown, DropdownButton } from 'react-bootstrap';
import { nanoid } from 'nanoid';
import React, { useCallback, useEffect, useRef } from 'react';
import ReactPaginate from 'react-paginate';
import showError from '../../helpers/toaster/message/showError';
import showSuccess from '../../helpers/toaster/message/showSuccess';
import { AnimationModel, GalleryAnimationFilter } from './animation/model';
import { useGallery } from './Provider';
import { StyledGallery } from './Styled';
import inputForm from '../../helpers/toaster/form/inputForm';

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

  const init = useCallback(() => {
    const AdobeAn = (window as any)['AdobeAn'];
    if (!AdobeAn) {
      return;
    }

    const imageOrSounds = [...animation.images, ...animation.sounds];
    // You must set different png file name
    const comp: any = Object.values(AdobeAn.compositions).find((composition: any) => {
      const libTmp=composition?.getLibrary();
      const hasSameResourceFile = libTmp?.properties?.manifest.find((resouce: {src: string, id: string}) => {
        return !!imageOrSounds.find((imageOrSound) => {
          const isSameResourceFile = resouce.src.includes(imageOrSound.name);
          if (isSameResourceFile) {
            resouce.src = imageOrSound.url;
          }

          return isSameResourceFile;
        });
      });

      return hasSameResourceFile;
    });

    let lib=comp.getLibrary();
    const loader = new createjs.LoadQueue(false);
    loader.addEventListener("fileload", function(evt: any){handleFileLoad(evt,comp)});
    loader.addEventListener("complete", function(evt: any){handleComplete(evt,comp)});
    lib=comp.getLibrary();

    loader.loadManifest(lib.properties.manifest);
  }, [animation]);

  const handleFileLoad = (evt: any, comp: any) => {
    const images=comp.getImages();	
    if (evt && (evt.item.type === "image")) { images[evt.item.id] = evt.result; }	
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

    //Registers the "tick" event listener.
    const fnStartAnimation = () => {
      stage.addChild(exportRoot);
      createjs.Ticker.framerate = lib.properties.fps;
      createjs.Ticker.addEventListener("tick", stage);
    }

    //Code to support hidpi screens and responsive scaling.
    // AdobeAn.makeResponsive(false,'both',false,1,[canvasRef.current,animationContainer.current,domOverlayContainer.current]);
    AdobeAn.compositionLoaded(lib.properties.id);
    fnStartAnimation();
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
  }, [animation, init]);

  return (
    <>
      {animation?.jsUrl && animation.images.length > 0 ? (
        <div ref={animationContainer}
          className='position-relative bg-white'
          style={{ width: '100%', height: 'calc(100% - 3rem)' }}
        >
          <canvas id="canvas" width="437" height="617"
            className='position-absolute bg-white'
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            ref={canvasRef}>
          </canvas>
          <div ref={domOverlayContainer}
            className='position-absolute'
            style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
          >
          </div>
        </div>
      ):(
        <img
          style={{ width: '100%', height: 'calc(100% - 3rem)', objectFit: 'contain' }}
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
    galleryPageAnimations,
    galleryAnimationFilter,
    currentSlack,
    slacks,
    uploadAnimation,
    removeAnimation,
    setAnimationsPageCurrent,
    setGalleryAnimationFilter,
    hasCollisionImageFileName,
    addSlack,
    removeSlack,
    updateCurrentSlack,
  } = useGallery();

  const filterIconMap: any = {
    NONE: (<FontAwesomeIcon icon={faSort} className='ms-2'/>),
    DESCENDING: (<FontAwesomeIcon icon={faSortDown} className='ms-2'/>),
    ASCENDING: (<FontAwesomeIcon icon={faSortUp} className='ms-2'/>),
  }

  const dropDirection = 'down';
  const dropMenualine = 'right';

  const handleAddSlack = useCallback(async () => {
    const res: any = await inputForm({
      title: 'Add Slack Channel',
    }, {
      token: {label: 'Slack Token', value: ''},
      channel: {label: 'Channel Id', value: ''},
      name: {label: 'Channel Name', value: ''},
    });

    if (res?.value) {
      try {
        await addSlack(res?.value);
        showSuccess({
          title: 'Add Slack Channel',
          text: 'Slack Channel is added!',
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
  }, [addSlack]);

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    fetch(fileUrl).then((res) => res.blob()).then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.download = fileName;
      a.href = url;
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 200)
    });
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
        jsFile: {
          label: '.js File',
          value: '',
          type: 'file',
          fileType: 'application/javascript',
          canBeNull: true,
        },
        imageFiles: {label: '.png Files', value: '', type: 'files', fileType: 'image/png'},
        soundFiles: {label: '.wav Files', value: '', type: 'files', fileType: 'audio/wav'},
      }
    )

    if (res?.value) {
      const { gifFile, flaFile, jsFile, imageFiles, soundFiles } = res.value;

      if (hasCollisionImageFileName(imageFiles)) {
        showError({
          title: 'Upload Animation',
          text: 'Same name png file is exist. Please Change image file name and pulish',
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
          imageFiles,
          soundFiles,
          jsFile,
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
  }, [uploadAnimation, hasCollisionImageFileName]);

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
        <div className='my-auto col-3'>
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

        <div className='d-flex col-6'>
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
        </div>

        {thisUser?.name === userName ? (
          <div className='my-auto col-3 d-flex'>
            <div className='ms-auto my-auto'>
              <button
                className='btn btn-outline-primary'
                onClick={handleUploadAnimation}
              >Upload Animation</button>
            </div>

            <DropdownButton
              menuAlign={dropMenualine}
              as={ButtonGroup}
              key={dropDirection}
              id={`dropdown-button-drop-${dropDirection}`}
              className={'dropdown-buttons ms-2 p-0 btn btn-outline-secondary'}
              size='sm'
              drop={dropDirection}
              variant=''
              title={'Slack'}
            >
              <Dropdown.Item
                eventKey='0'
                onClick={handleAddSlack}
              >
                Add Slack Channel
              </Dropdown.Item>

              <Dropdown.Divider />

              <Dropdown.Header>Slack Channel</Dropdown.Header>
              {
                slacks.map((slack) => (
                  <Dropdown.Item
                    key={slack.channel}
                    eventKey={slack.channel}
                  >
                    {slack.name}
                    <button
                      className={
                        `btn btn-sm ms-2 ${slack.channel === currentSlack?.channel
                          ? 'btn-success'
                          : 'btn-outline-secondary'
                        }`
                      }
                      disabled={slack.channel === currentSlack?.channel}
                      onClick={() => {
                        if (slack.channel !== currentSlack?.channel) {
                          updateCurrentSlack(slack);
                        }
                      }}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                      className='btn btn-sm btn-secondary ms-2'
                      onClick={() => {
                        removeSlack(slack);
                        if (slack.channel === currentSlack?.channel) {
                          updateCurrentSlack(null);
                        }
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </Dropdown.Item>
                ))
              }
            </DropdownButton>
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
        
      {!isLoading && galleryPageAnimations.length === 0 ? (
        <div className='container p-2 d-flex flex-column'>
          <div className='alert alert-secondary text-center fs-3' role='alert'>
            No Animation
          </div>
        </div>
      ):(
        <div className='container p-2 d-flex flex-column'>
          <div className='row'>
            {galleryPageAnimations.map((animation) => {
              return (
                <div
                  key={animation.id}
                  className='m-auto p-2'
                  style={{ width: '33.3%', height: '30vh' }}
                >
                  <div
                    style={{
                      width: '100%', height: '100%',
                      boxShadow: '0 10px 25px 0 rgba(0, 0, 0, .5)'
                    }}
                  >

                    <div
                      className='d-flex bg-warning'
                      style={{ width: '100%', height: '3rem'}}
                    >
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

                        {animation?.jsName && animation.images.length > 0 ? (
                          <>
                            <Dropdown.Item
                              eventKey='3'
                              onClick={() => handleDownloadFile(animation.jsUrl, animation.jsName)}
                            >
                              <FontAwesomeIcon icon={faDownload} className='me-2'/>
                              {animation.jsName}
                            </Dropdown.Item>
                            
                            {animation.images.map((image, index) => (
                              <Dropdown.Item
                                key={`image${index}`}
                                eventKey={`image${index}`}
                                onClick={() => handleDownloadFile(image.url, image.name)}
                              >
                                <FontAwesomeIcon icon={faDownload} className='me-2'/>
                                {image.name}
                              </Dropdown.Item>
                            ))}
                          </>
                        ):(<></>)}
                      </DropdownButton>
                    </div>

                    <GalleryAnimationRenderer animation={animation}></GalleryAnimationRenderer>
                  </div>
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
