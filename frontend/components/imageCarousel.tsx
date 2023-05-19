import {Carousel} from "react-bootstrap";
import Image from "next/image";
import filler_image_1 from "@/public/filler_image_1.png";
import filler_image_2 from "@/public/filler_image_2.png";
import filler_image_3 from "@/public/filler_image_3.png";
import styles from "@/styles/Login.module.css";


export default function CarouselComponent() {
    return (
        <Carousel className="carousel" indicators={true} controls={false} fade={true} interval={6000}>
            <Carousel.Item >
                <Image className={"filler_image d-block"} src={filler_image_1} alt="First slide"/>
            </Carousel.Item>
            <Carousel.Item className={styles.filler_image}>
                <Image className={"filler_image d-block"} src={filler_image_2} alt="Second slide"/>
            </Carousel.Item>
            <Carousel.Item className={styles.filler_image}>
                <Image className={"filler_image d-block"} src={filler_image_3} alt="Third slide"/>
            </Carousel.Item>
        </Carousel>
    );
}

