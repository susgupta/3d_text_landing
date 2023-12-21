import { 
  CameraControls, 
  Environment, 
  MeshReflectorMaterial, 
  Text,
  RenderTexture,
  Float,
  useFont
} 
from "@react-three/drei";
import { Camping } from "./Camping";
import { degToRad, lerp } from "three/src/math/MathUtils";
import { useEffect, useRef } from "react";
import { Color } from "three";
import { currentPageAtom } from "./UI";
import { useAtom } from 'jotai';
import { useFrame } from "@react-three/fiber";

//define colour for bloom effect on text
const BLOOM_COLOUR = new Color("#FFFFFF");
BLOOM_COLOUR.multiplyScalar(1.5);

export const Experience = () => {

  const controls = useRef();
  const meshFitCameraHome = useRef();
  const meshFitCameraStore = useRef();
  const textMaterial = useRef();
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom);

  //hide text only show for intro and home spots, not on zoomed in effect
  useFrame((_, delta) => {
    textMaterial.current.opacity = lerp(
      textMaterial.current.opacity, 
      currentPage === "home" || currentPage === "intro" ? 1 : 0, 
      delta * 1.5
    );
  });

  //control intro camnera 
  const intro = async () => {
    //default push back camera, and animate back
    controls.current.dolly(-22);
    controls.current.smoothTime = 1.5;
    setTimeout(() => {
      setCurrentPage("home")
    }, 1200)
    fitCamera();
  }

  const fitCamera = async () => {
    if (currentPage === "store"){
      controls.current.smoothTime = 0.75;
      controls.current.fitToBox(meshFitCameraStore.current, true);
    }
    else{
      controls.current.smoothTime = 1.5;
      controls.current.fitToBox(meshFitCameraHome.current, true);
    }
  }

  //this will allow programmtic control of camera
  useEffect(() => {
    intro()
  }, []);

  //force animation to make zoom effect responsive, use the force fit camera
  useEffect(() => {
    fitCamera();
    window.addEventListener("resize", fitCamera);
    return () => window.removeEventListener("resize", fitCamera);
  }, [currentPage]);

  return (
    <>
      <CameraControls ref={controls} />

      <mesh ref={meshFitCameraHome} position-z={1.5} visible={false}>
        <boxGeometry args={[7.5, 2, 2]}/>
        <meshBasicMaterial color="orange" transparent opacity={0.5} />
      </mesh>

      <Text 
        font={"fonts/Poppins-Black.ttf"} 
        position-x={-1.3} 
        position-y={-0.5} 
        position-z={1} 
        lineHeight={0.8} 
        textAlign="center"
        rotation-y={degToRad(30)}
        anchorY={"bottom"}
      > 
        MY COOL{"\n"}CAMPING
        <meshBasicMaterial color={BLOOM_COLOUR} toneMapped={false} ref={textMaterial}>

          <RenderTexture attach={"map"}>
            <color attach={"background"} args={["#FFFFFF"]}/>
            <Environment preset="sunset"/>

            <Float floatIntensity={4} rotationIntensity={5}>
              <Camping 
                scale={1.6}
                rotation-y={degToRad(25)}
                rotation-x={degToRad(40)}
                position-y={-0.5}
              />
            </Float>

          </RenderTexture>

        </meshBasicMaterial>

      </Text>

      <group rotation-y={degToRad(-25)} position-x={3}>
        <Camping scale={0.6} html />
        <mesh ref={meshFitCameraStore} visible={false}>
          <boxGeometry args={[2, 1, 2]}/>
          <meshBasicMaterial color="red" transparent opacity={0.5}/>
        </mesh>
      </group>

      <mesh position-y={-0.48} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[100, 100]} />
        <MeshReflectorMaterial
          blur={[100, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={10}
          roughness={1}
          depthScale={1}
          opacity={0.5}
          transparent
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#333"
          metalness={0.5}
        />
      </mesh>

      <Environment preset="sunset"/>
    </>
  );
};

useFont.preload("fonts/Poppins-Black.ttf");
