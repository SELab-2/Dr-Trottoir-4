import BaseHeader from "@/components/header/BaseHeader";
import styles from "styles/Welcome.module.css";
import soon from "public/coming_soon.png";
import Image from "next/image";
import api from "../lib/axios"
import {useEffect, useState} from "react";

function Welcome() {

    const getData = async () => {
      try {
        const response = await api.get('/users', {withCredentials: true});
        return response.data;
      } catch (error) {
        // Handle API error
      }
    };

    const [data, setData] = useState([]);

      useEffect(() => {
        async function fetchData() {
          const result = await getData();
          setData(result);
        }
        fetchData();
      }, []);

      if (!data || data.length == 0) {
        return (
            <>
                <BaseHeader/>
                <p className={styles.title}>Welcome!</p>
                <Image src={soon} alt="Site coming soon" className={styles.image}/>
            </>
        )
      } else {
          return (
            <>
                <BaseHeader/>
                <p className={styles.title}>Welcome!</p>
                <Image src={soon} alt="Site coming soon" className={styles.image}/>
                <h1 className={styles.text}>Users:</h1>
                  <ul>
                      {data.map((item, index) => (
                        <li key={index}>{JSON.stringify(item)}</li>
                      ))}
                    </ul>
            </>
    )
      }

}

export default Welcome