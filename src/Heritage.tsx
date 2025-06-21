import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { databases, storage } from "./appwriteConfig";
import { Query } from "appwrite";

type HeritageProps = {
  onClose: () => void;
  location: {
    lat: number;
    lng: number;
    label: string;
  };
};

const Heritage: React.FC<HeritageProps> = ({ onClose, location }) => {
  const [item, setItem] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!location) return;

      try {
        const response = await databases.listDocuments(
          "6856988d0014123d37b0", // databaseId
          "6856989d00236c848d19", // collectionId
          [
            Query.equal("latitude", location.lat),
            Query.equal("longtitude", location.lng),
          ]
        );

        if (response.documents.length > 0) {
          const doc = response.documents[0];
          setItem(doc);

          if (doc.imageID) {
            const fileView = await storage.getFileView(
              "68569a0f0035922103c3", // your bucket ID
              doc.imageID
            );
            setImageUrl(fileView);
          }
        } else {
          console.warn("No matching heritage item found.");
        }
      } catch (error) {
        console.error("Error fetching heritage item:", error);
      }
    };

    fetchData();
  }, [location]);

  const handleCollectRewards = () => {
    navigate("/food");
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-white z-50 overflow-auto px-4 py-6 sm:px-6">
      <div className="max-w-md mx-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 text-2xl text-gray-600 hover:text-black"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold mb-4 mt-10 text-center">
          {location.label}
        </h2>

        {/* Image */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={item?.name || location.label}
            className="w-full h-48 object-cover rounded mb-4"
          />
        )}

        {/* Description */}
        {item ? (
          <p className="text-gray-700 text-sm mb-6">
            {item.description || "No description available."}
          </p>
        ) : (
          <p className="text-center text-gray-500">Loading heritage info...</p>
        )}

        {/* Collect Rewards Button */}
        <button
          onClick={handleCollectRewards}
          className="w-full bg-blue-600 text-white py-3 rounded text-sm font-medium hover:bg-blue-700 transition"
        >
          Collect Rewards
        </button>
      </div>
    </div>
  );
};

export default Heritage;
