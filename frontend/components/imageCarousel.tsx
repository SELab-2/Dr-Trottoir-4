import {Carousel} from "react-bootstrap";
import Image from "next/image";
import filler_image_1 from "@/public/filler_image_1.png";
import filler_image_2 from "@/public/filler_image_2.png";
import filler_image_3 from "@/public/filler_image_3.png";
import styles from "@/styles/Login.module.css";


export default function CarouselComponent() {
    return (
        <Carousel indicators={false} controls={false} fade={true} interval={3000}>
            <Carousel.Item >
                <Image id="filler_image" className="d-block w-100" src={filler_image_1} alt="First slide"/>
            </Carousel.Item>
            <Carousel.Item className={styles.filler_image}>
                <Image id="filler_image" className="d-block w-100" src={filler_image_2} alt="Second slide"/>
            </Carousel.Item>
            <Carousel.Item className={styles.filler_image}>
                <Image id="filler_image" className="d-block w-100" src={filler_image_3} alt="Third slide"/>
            </Carousel.Item>
        </Carousel>
    );
}

