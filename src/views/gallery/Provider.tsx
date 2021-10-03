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
    jsFile?: File,
    pngFile?: File,
  ) => Promise<void>;
  removeAnimation: (meta: AnimationModel) => Promise<void>;
  setAnimationsPageCurrent: (animationsPageCurrent: number) => void;
  setGalleryAnimationFilter: (galleryAnimationFilter: GalleryAnimationFilter) => void;
  hasCollisionPngFile: (pngFile: File) => boolean;
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
    jsFile?: File,
    pngFile?: File,
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

    let uploadPromises = [
      uploadBytes(
        storageRef(storage, gifFileRef), gifFile, {contentType: gifFile.type}
      ),
      uploadBytes(
        storageRef(storage, flaFileRef), flaFile, {contentType: flaFile.type}
      )
    ];

    if (jsFile && pngFile) {
      const jsFileRef = [
        gallaryRef,
        `annimations/${meta.id}`,
        `js/${jsFile.name}`,
      ].join('/');
  
      const pngFileRef = [
        gallaryRef,
        `annimations/${meta.id}`,
        `png/${pngFile.name}`,
      ].join('/');

      uploadPromises = [
        ...uploadPromises,
        uploadBytes(
          storageRef(storage, jsFileRef), jsFile, {contentType: jsFile.type}
        ),
        uploadBytes(
          storageRef(storage, pngFileRef), pngFile, {contentType: pngFile.type}
        ),
      ];
    }

    const uploadTasks = await Promise.all(uploadPromises);

    meta.gifUrl = await getDownloadURL(uploadTasks[0].ref);
    meta.gifName = gifFile.name;
    meta.flaUrl = await getDownloadURL(uploadTasks[1].ref);
    meta.flaName = flaFile.name;

    if (jsFile && pngFile) {
      meta.jsUrl = await getDownloadURL(uploadTasks[2].ref);
      meta.jsName = jsFile.name;
      meta.pngUrl = await getDownloadURL(uploadTasks[3].ref);
      meta.pngName = pngFile.name;
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

    if (meta.pngUrl) {
      deletePromises.push(deleteObject(storageRef(storage, meta.pngUrl)));
    }

    await Promise.all(deletePromises);

    return updateDoc(doc(firestore, gallaryRef), {
      animations: arrayRemove(Object.assign({}, meta)),
    });
  }, [firestore, storage, thisUser, ANI_CANVAS_PATH, arrayRemove]);

  const hasCollisionPngFile = useCallback((pngFile: File) => {
    return !!galleryAnimations.find((animation) => animation.pngName === pngFile.name);
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
        if (thisUser && userName === thisUser.name) {
          console.log('init');
          await initThisUserGallery();
          userIds = thisUser.id;
        } else {
          history.push(routes.HOME);
          return;
        }
      }

      const galleryRef = [
        ANI_CANVAS_PATH,
        `galleries/${userIds}`,
      ].join('/');
  
      unsubscribeGallery = onSnapshot(doc(firestore, galleryRef), (gallerySnapshot) => {
        const galleryModel = gallerySnapshot.data() as GalleryModel;
        if (!galleryModel) {
          setGalleryPageAnimations([]);
          setIsLoading(false);
          return;
        }

        const animations: Array<AnimationModel> = Object.assign([], galleryModel.animations);
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
    hasCollisionPngFile,
  };

  return (
    <GalleryContext.Provider value={providerValue}>
      {children}
    </GalleryContext.Provider>
  );
}
