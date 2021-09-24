import { faAngleLeft, faAngleRight, faSort, faSortDown, faSortUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { nanoid } from 'nanoid';
import React, { useCallback } from 'react';
import ReactPaginate from 'react-paginate';
import inputForm from '../../helpers/toaster/form/inputForm';
import showError from '../../helpers/toaster/message/showError';
import showSuccess from '../../helpers/toaster/message/showSuccess';
import { AnimationModel, GalleryAnimationFilter } from './animation/model';
import { useGallery } from './Provider';
import { StyledGallery } from './Styled';

type Props = {};

const GalleryRenderer: React.FC<Props> = () => {
  const {
    thisUser,
    userName,
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

  const handleUploadAnimation = useCallback(async () => {
    const res = await inputForm(
      {
        title: 'Upload Animation',
        confirmButtonText: 'Confirm',
      },
      {
        gifFile: {label: '.gif File', value: '', type: 'file', fileType: 'image/gif'},
        flaFile: {label: '.fla File', value: '', type: 'file'},
      }
    )

    if (res?.value) {
      const { gifFile, flaFile } = res.value;
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
      })
      try {
        await uploadAnimation(gifFile, flaFile, Object.assign({}, newAnimation));
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

        {thisUser?.name === userName ? (
          <div className='ms-auto my-auto'>
            <button
              className='btn btn-outline-primary'
              onClick={handleUploadAnimation}
            >Upload Animation</button>
          </div>
        ):(<></>)}
      </div>

      {galleryAnimations.length === 0 ? (
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
                    <span className='me-auto text-dark text-break fs-5'>{animation.name}</span>
                    {thisUser?.name === userName ? (
                      <button
                        className='btn btn-secondary ms-auto'
                        onClick={() => handleRemoveAnimation(animation)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    ):(<></>)}
                  </div>
                  <img
                    style={{ objectFit: 'contain', width: '100%', height: '100%'}}
                    src={animation.gifUrl}
                    alt={animation.name}
                  ></img>
                </div>
              )
            })}
          </div>
          <ReactPaginate
            previousLabel={<FontAwesomeIcon icon={faAngleLeft} className='me-3' />}
            nextLabel={<FontAwesomeIcon icon={faAngleRight} className='ms-3' />}
            breakLabel={'...'}
            breakClassName={'break-me'}
            pageCount={animationsPageLast}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={(data: any) => setAnimationsPageCurrent(data.selected)}
            containerClassName={'pagination'}
            activeClassName={'active'}
          />
        </div>
      )}
    </StyledGallery>
  )
}

export default GalleryRenderer;
