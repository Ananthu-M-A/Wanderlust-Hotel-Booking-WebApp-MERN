import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import * as apiClient from "../../../api-client";
import { AiFillStar } from "react-icons/ai";
import GuestInfoForm from "../../../forms/GuestInfoForm/GuestInfoForm";

const Detail = () => {
  const { hotelId } = useParams();

  const { data: hotel } = useQuery({
    queryKey: ["loadHotelHomeById", hotelId],
    queryFn: () => apiClient.loadHotelHomeById(hotelId as string),
    enabled: !!hotelId,
  });

  if (!hotel) {
    return <></>;
  }

  return (
    <>
      <Helmet>
        <title>{hotel.name} | Wanderlust Hotel Booking</title>
        <meta
          name="description"
          content={hotel.description?.slice(0, 150) || "Hotel details"}
        />
        <meta property="og:title" content={hotel.name} />
        <meta
          property="og:description"
          content={hotel.description?.slice(0, 150) || "Hotel details"}
        />
        {hotel.imageUrls[0] && (
          <meta property="og:image" content={hotel.imageUrls[0]} />
        )}
      </Helmet>
      <div className="space-y-6 bg-gray-100 p-5 border border-slate-300 rounded">
        <div>
          <span className="flex">
            {Array.from({ length: hotel.starRating }).map((_, index) => (
              <AiFillStar key={index} className="fill-yellow-400" />
            ))}
          </span>
          <h1 className="text-3xl font-bold">{hotel.name}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {hotel.imageUrls.map((image, index) => (
            <div key={index} className="h-[300px]">
              <img
                src={image}
                alt={hotel.name}
                className="rounded-md w-full h-full object-cover object-center"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {hotel.facilities.map((facility, index) => (
            <div key={index} className="border border-slate-300 rounded-sm p-3">
              {facility}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
          <div className="whitespace-pre-line">{hotel.description}</div>
          <div className="h-fit">
            <GuestInfoForm roomTypes={hotel.roomTypes} hotelId={hotel._id} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Detail;
