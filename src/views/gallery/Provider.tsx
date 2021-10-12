import { collection, doc, getDocs, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { ref as storageRef, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import React, { useContext, ReactNode, useEffect, useState, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import routes from '../../constants/routes';
import { useAuth } from '../../providers/AuthProvider';
import { useFirebase } from '../../providers/FirebaseProvider';
import { UserModel } from '../user/model';
import { AnimationIndex, AnimationModel, GalleryAnimationFilter } from './animation/model';
import { GalleryModel } from './model';

type Props = {
  children: ReactNode;
};

interface GalleryValue {
  thisUser?: UserModel;
  userName: string;
  isLoading: boolean;
  galleryPageAnimations: Array<AnimationModel>;
  animationsPageCurrent: number;
  animationsPageLast: number;
  galleryAnimationFilter: GalleryAnimationFilter;
  uploadAnimation: (
    meta: AnimationModel,
    gifFile: File,
    flaFile: File,
    imageFiles: Array<File>,
    soundFiles: Array<File>,
    jsFile?: File,
  ) => Promise<void>;
  removeAnimation: (meta: AnimationModel) => Promise<void>;
  setAnimationsPageCurrent: (animationsPageCurrent: number) => void;
  setGalleryAnimationFilter: (galleryAnimationFilter: GalleryAnimationFilter) => void;
  hasCollisionImageFileName: (imageFile: Array<File>) => boolean;
}

const GalleryContext = React.createContext<GalleryValue | null>(null);

export function useGallery(): GalleryValue {
  const state = useContext(GalleryContext);

  if (!state) {
    throw new Error('useGallery must be used within GalleryProvider');
  }

  return state;
}

export function GalleryProvider({ children }: Props) {
  const { userName } = useParams<any>();
  const { thisUser, setSession } = useAuth();
  const { ANI_CANVAS_PATH, SHARE_PATH, firestore, storage, arrayUnion, arrayRemove } = useFirebase();
  const history = useHistory();

  const [ animationsPageCurrent, setAnimationsPageCurrent ] = useState<number>(0);
  const [ animationsPageLast, setAnimationPageLast ] = useState<number>(1);
  const [ animationsPerPage, ] = useState<number>(30);
  const [ isLoading, setIsLoading ] = useState<boolean>(true);
  const [ galleryAnimations, setGalleryAnimations ] = useState<Array<AnimationModel>>([]);
  const [ galleryPageAnimations, setGalleryPageAnimations ] = useState<Array<AnimationModel>>([]);
  const [ galleryAnimationFilter, setGalleryAnimationFilter ] = useState<GalleryAnimationFilter>({
    createdAt: 'DESCENDING',
    name: 'NONE',
  });

  // Sorting Priority : createdAt > name
  const sortAnimation = useCallback((animations: Array<AnimationIndex|AnimationModel>) => {
    animations.sort((groupAnimationIndexA, groupAnimationIndexB) => {

      // createdAt
      if (groupAnimationIndexA.createdAt !== groupAnimationIndexB.createdAt
        && galleryAnimationFilter.createdAt !== 'NONE'
      ) {
        return galleryAnimationFilter.createdAt === 'ASCENDING'
          ? groupAnimationIndexA.createdAt - groupAnimationIndexB.createdAt
          : groupAnimationIndexB.createdAt - groupAnimationIndexA.createdAt;
      }

      // name
      if (groupAnimationIndexA.name !== groupAnimationIndexB.name
        && galleryAnimationFilter.name !== 'NONE'
      ) {
        return galleryAnimationFilter.name === 'ASCENDING'
          ? groupAnimationIndexA.name.localeCompare(groupAnimationIndexB.name,'ja')
          : groupAnimationIndexB.name.localeCompare(groupAnimationIndexA.name,'ja');
      }

      return 0;
    });
  }, [galleryAnimationFilter.createdAt, galleryAnimationFilter.name]);

  const initThisUserGallery = useCallback(async () => {
    if (!thisUser) {
      return;
    }

    const galleryRef = [
      ANI_CANVAS_PATH,
      `galleries/${thisUser.id}`,
    ].join('/');

    const newGallery = new GalleryModel({
      id: thisUser.id,
      ref: galleryRef,
      name: thisUser.name,
    });

    return setDoc(doc(firestore, galleryRef), Object.assign({}, newGallery));
  }, [firestore, thisUser, ANI_CANVAS_PATH]);

  const uploadAnimation = useCallback(async (
    meta: AnimationModel,
    gifFile: File,
    flaFile: File,
    imageFiles: Array<File>,
    soundFiles: Array<File>,
    jsFile?: File,
  ) => {
    if (!thisUser) {
      return;
    }

    const gallaryRef = [
      ANI_CANVAS_PATH,
      `galleries/${thisUser.id}`,
    ].join('/');

    const gifFileRef = [
      gallaryRef,
      `annimations/${meta.id}`,
      `gif/${gifFile.name}`,
    ].join('/');

    const flaFileRef = [
      gallaryRef,
      `annimations/${meta.id}`,
      `fla/${flaFile.name}`,
    ].join('/');

    await uploadBytes(
      storageRef(storage, gifFileRef), gifFile, {contentType: gifFile.type}
    )
      .then((uploadTask) => getDownloadURL(uploadTask.ref))
      .then((url) => {
        meta.gifUrl = url;
        meta.gifName = gifFile.name;
      });

    await uploadBytes(
      storageRef(storage, flaFileRef), flaFile, {contentType: flaFile.type}
    )
      .then((uploadTask) => getDownloadURL(uploadTask.ref))
      .then((url) => {
        meta.flaUrl = url;
        meta.flaName = flaFile.name;
      });

    if (jsFile && imageFiles.length > 0) {
      const jsFileRef = [
        gallaryRef,
        `annimations/${meta.id}`,
        `js/${jsFile.name}`,
      ].join('/');

      await uploadBytes(
        storageRef(storage, jsFileRef), jsFile, {contentType: jsFile.type}
      )
        .then((uploadTask) => getDownloadURL(uploadTask.ref))
        .then((url) => {
          meta.jsUrl = url;
          meta.jsName = jsFile.name;
        });
  
      for (const imageFile of imageFiles) { 
        const imageFileRef = [
          gallaryRef,
          `annimations/${meta.id}`,
          `images/${imageFile.name}`,
        ].join('/');

        await uploadBytes(
          storageRef(storage, imageFileRef), imageFile, {contentType: imageFile.type}
        )
          .then((uploadTask) => getDownloadURL(uploadTask.ref))
          .then((url) => {
            meta.images.push({url, name: imageFile.name});
          });
      };

      for (const soundFile of soundFiles) { 
        const soundFileRef = [
          gallaryRef,
          `annimations/${meta.id}`,
          `sounds/${soundFile.name}`,
        ].join('/');
  
        await uploadBytes(
          storageRef(storage, soundFileRef), soundFile, {contentType: soundFile.type}
        )
          .then((uploadTask) => getDownloadURL(uploadTask.ref))
          .then((url) => {
            meta.sounds.push({url, name: soundFile.name});
          });
      };
    }

    return updateDoc(doc(firestore, gallaryRef), {
      animations: arrayUnion(Object.assign({}, meta)),
    });
  }, [firestore, storage, thisUser, ANI_CANVAS_PATH, arrayUnion]);

  const removeAnimation = useCallback(async (meta: AnimationModel) => {
    if (!thisUser) {
      return;
    }

    const gallaryRef = [
      ANI_CANVAS_PATH,
      `galleries/${thisUser.id}`,
    ].join('/');

    const deletePromises = [
      deleteObject(storageRef(storage, meta.flaUrl)),
      deleteObject(storageRef(storage, meta.gifUrl)),
    ];

    if (meta.jsUrl) {
      deletePromises.push(deleteObject(storageRef(storage, meta.jsUrl)));
    }

    meta.images.forEach((image) => {
      deletePromises.push(deleteObject(storageRef(storage, image.url)));
    })

    meta.sounds.forEach((sound) => {
      deletePromises.push(deleteObject(storageRef(storage, sound.url)));
    })

    await Promise.all(deletePromises);

    return updateDoc(doc(firestore, gallaryRef), {
      animations: arrayRemove(Object.assign({}, meta)),
    });
  }, [firestore, storage, thisUser, ANI_CANVAS_PATH, arrayRemove]);

  const hasCollisionImageFileName = useCallback((imageFiles: Array<File>) => {
    return !!galleryAnimations.find((animation) => {
      return !!imageFiles.find((imageFile) => {
        return animation.images.map(image => image.name).includes(imageFile.name);
      });
    });
  }, [galleryAnimations])

  useEffect(() => {
    let unsubscribeGallery = () => {};

    const usersRef = [
      SHARE_PATH,
      `users`,
    ].join('/');
    const q = query(collection(firestore, usersRef), where('name', '==', userName));
    getDocs(q).then(async (usersSnapshot) => {
      const [userDoc] = usersSnapshot.docs;

      let userIds = userDoc?.ref?.id;
      if (!userIds) {
        history.push(routes.HOME);
        return;
      }

      const galleryRef = [
        ANI_CANVAS_PATH,
        `galleries/${userIds}`,
      ].join('/');
  
      unsubscribeGallery = onSnapshot(doc(firestore, galleryRef), (gallerySnapshot) => {
        const galleryModel = gallerySnapshot.data() as GalleryModel;
        if (!galleryModel) {
          if (thisUser && userName === thisUser.name) {
            console.log('init');
            initThisUserGallery();
            userIds = thisUser.id;
          }

          setGalleryPageAnimations([]);
          setIsLoading(false);
          return;
        }

        const animations: Array<AnimationModel> = galleryModel?.animations || [];
        sortAnimation(animations);
        setGalleryAnimations(animations);

        const animationIds = animations.map((animation) => animation.id);
        setAnimationPageLast(Math.floor((animationIds.length - 1) / animationsPerPage) + 1);

        const startAnimation = animationsPageCurrent * animationsPerPage;
        const endAnimation = startAnimation + animationsPerPage;
        const selectedAnimations = animations.splice(startAnimation, endAnimation);
        setGalleryPageAnimations(selectedAnimations);
        setSession(galleryRef);
        setIsLoading(false);
      });
    });

    return () => {
      setGalleryPageAnimations([]);
      unsubscribeGallery();
      setIsLoading(true);
    }
  }, [ANI_CANVAS_PATH, thisUser, SHARE_PATH, animationsPageCurrent, animationsPerPage, firestore, history, initThisUserGallery, setSession, sortAnimation, userName]);

  const providerValue = {
    thisUser,
    userName,
    isLoading,
    galleryPageAnimations,
    animationsPageCurrent,
    animationsPageLast,
    galleryAnimationFilter,
    uploadAnimation,
    removeAnimation,
    setAnimationsPageCurrent,
    setGalleryAnimationFilter,
    hasCollisionImageFileName,
  };

  return (
    <GalleryContext.Provider value={providerValue}>
      {children}
    </GalleryContext.Provider>
  );
}
