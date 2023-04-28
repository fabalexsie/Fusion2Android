import { notifications } from '@mantine/notifications';
import { ReactElement, useEffect, useState } from 'react';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Progress } from './Progress';
import { Alert, Box, Group, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export function GLTFViewer({
  modelLink,
  height,
}: {
  modelLink: string;
  height: number;
}): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewWidth, setViewWidth] = useState(-1);
  const [viewHeight, setViewHeight] = useState(height);
  const resizeTimeoutRef = useRef<number>(0);

  const animRequestRef = useRef<number>(0);
  const [parentGroup, setParentGroup] = useState<THREE.Object3D | null>(null);

  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    setViewWidth(containerRef.current?.clientWidth || -1);
    setViewHeight(containerRef.current?.clientHeight || -1);

    const observer = new ResizeObserver(() => {
      window.clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = window.setTimeout(() => {
        setViewWidth(containerRef.current?.clientWidth || -1);
        setViewHeight(containerRef.current?.clientHeight || -1);
      }, 300); // 300ms is the default timeout for the resize event, before it is fired
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  const [renderer, scene, camera] = useMemo(() => {
    if (viewWidth <= 0 || viewHeight <= 0) return [null, null, null];

    const _scene = new THREE.Scene();

    const _camera = new THREE.PerspectiveCamera(
      45,
      viewWidth / viewHeight,
      0.1,
      1000
    );
    const cameraHeight = 1;
    const cameraDistance = 2;
    const cameraFloorDistance =
      Math.cos(Math.asin(cameraHeight / cameraDistance)) * cameraDistance;
    _camera.position.set(0, cameraHeight, cameraFloorDistance);
    _camera.lookAt(0, 0, 0);
    _scene.add(_camera);

    const loadManager = new THREE.LoadingManager();
    loadManager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      setLoadingProgress((_loadingProg) => (itemsLoaded / itemsTotal) * 100);
    };
    loadManager.onLoad = () => {
      setLoadingProgress((_) => 100);
    };
    loadManager.onError = (url) => {
      notifications.show({
        title: 'Error',
        message: `Error loading model from ${url}`,
        color: 'red',
      });
      setLoadingProgress((_) => -1);
    };

    const loader = new GLTFLoader(loadManager);
    loader.load(modelLink, (gltf) => {
      // get the bounding box of the model
      const box = new THREE.Box3().setFromObject(gltf.scene);

      // center the model inside the pivot
      const boxCenter = box.getCenter(new THREE.Vector3());
      gltf.scene.translateX(-boxCenter.x);
      gltf.scene.translateY(-boxCenter.y);
      gltf.scene.translateZ(-boxCenter.z);

      // parent group for the model to rotate it
      const pivotParent = new THREE.Group();
      pivotParent.add(gltf.scene);
      _scene.add(pivotParent);

      setParentGroup(pivotParent);
    });

    // add some light at each corner
    const light1 = new THREE.PointLight(0xffffff, 0.75);
    light1.position.set(1, 2, 1);
    _scene.add(light1);
    const light2 = new THREE.PointLight(0xffffff, 0.75);
    light2.position.set(-1, 2, 1);
    _scene.add(light2);
    const light3 = new THREE.PointLight(0xffffff, 0.75);
    light3.position.set(1, 2, -1);
    _scene.add(light3);
    const light4 = new THREE.PointLight(0xffffff, 0.75);
    light4.position.set(-1, 2, -1);
    _scene.add(light4);

    // add a red cube at the z axis
    // DEBUG
    // const cube = new THREE.Mesh(
    //   new THREE.BoxGeometry(0.01, 1, 0.01),
    //   new THREE.MeshBasicMaterial({ color: 0xff0000 })
    // );
    // cube.position.set(0, 0.5, 0);
    // _scene.add(cube);

    try {
      const _renderer = new THREE.WebGLRenderer({ alpha: true });
      _renderer.setSize(viewWidth, viewHeight);
      _scene.background = new THREE.Color(0xffffff);
      _renderer.setClearColor(0xffffff, 1);
      return [_renderer, _scene, _camera];
    } catch (e) {
      notifications.show({
        id: 'renderer-error',
        title: 'Error',
        message: `${e}`,
        color: 'red',
      });
      return [null, null, null];
    }
  }, [modelLink, viewWidth, viewHeight]);

  useEffect(() => {
    if (renderer && containerRef.current) {
      const keepRefForCleanup = containerRef.current;
      keepRefForCleanup.appendChild(renderer.domElement);
      return () => {
        keepRefForCleanup.removeChild(renderer.domElement);
      };
    }
  }, [renderer, containerRef]);

  useEffect(() => {
    function animRotation() {
      animRequestRef.current = requestAnimationFrame(animRotation);

      if (parentGroup) parentGroup.rotation.y += 0.005;

      if (renderer) renderer.render(scene, camera);
    }
    animRotation();
    return () => cancelAnimationFrame(animRequestRef.current);
  }, [renderer, scene, camera, parentGroup]);

  return (
    <Box pos="relative">
      <Group pos="relative" top={0} left={0} right={0} bottom={0}>
        <div ref={containerRef} style={{ height: height, width: '100%' }}></div>
        {!renderer && loadingProgress >= 100 && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            color="red"
            radius="md"
            style={{ margin: 'auto' }}
          >
            3D-Renderer could not be loaded
          </Alert>
        )}
      </Group>
      <Group
        pos="absolute"
        position="center"
        top={0}
        left={0}
        right={0}
        bottom={0}
      >
        <Progress progress={loadingProgress} onFinishedFadeOutMS={1000} />
      </Group>
    </Box>
  );
}
