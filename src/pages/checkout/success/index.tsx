import React, {useEffect} from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store";
import {useRouter} from 'next/router'

const success = () => {
  const order = useSelector((state: RootState) => state.order.value);
  const router = useRouter()
  
  useEffect(() => {
    if (!order) router.push('/')
  },[])

  if (!order) return <></>

  return (
    <div className="max-w-6xl mx-auto flex flex-col justify-center items-center space-y-3">
      <img className="max-w-xl" src="/vectors/ReadingSideDoodle.svg" alt="" />
      <span className="text-2xl font-bold text-center">Thanks {order?.attributes.firstName} for chossing us!</span>
      <span className="text-lg font-bold text-gray-500 text-center">
        We've sent an email with the details of your order to {order?.attributes.email}
      </span>
    </div>
  );
};

export default success;
