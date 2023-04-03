import React from "react";
import BaseHeader from "@/components/header/baseHeader";
import Image from "next/image";
import fire from "@/public/fire_image.png";
import styles from "@/styles/Login.module.css";
import SignupForm from "@/components/signupform";

export default function Signup() {
    return (
        <>
            <BaseHeader />
            <div className="container py-5 h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col col-xl-10">
                        <div className="card">
                            <div className="row g-0">
                                <div className="col-md-6 col-lg-5 d-none d-md-block">
                                    <Image src={fire} alt="My App Logo" className={styles.filler_image} />
                                </div>
                                <div className="col-md-6 col-lg-7 d-flex align-items-center">
                                    <div className="card-body p-4 p-lg-5 text-black">
                                        <SignupForm />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
