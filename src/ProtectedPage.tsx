import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import httpService from "src/httpService";

// Define TypeScript interfaces for the ingredient data structure
interface Ingredient {
  name: string;
  category: string;
  subcategory: string;
  current_price: number;
  clean_image_url: string;
}

interface ApiResponse {
  [category: string]: {
    [subcategory: string]: Ingredient[];
  };
}

export function ProtectedPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSpinner, setShowSpinner] = useState<boolean>(true);

  // Function to fetch ingredients
  const fetchIngredients = async () => {
    try {
      const queryParams = new URLSearchParams({
        categories: "CHICKEN,BACON,CHEESE",
        postalCode: "98225",
      });

      const response = await httpService.fetchWithAuth({
        url: `/search/ingredients?${queryParams.toString()}`,
      });

      const data: ApiResponse = await response.json();

      const flattenedData = Object.values(data).flatMap((category) =>
        Object.values(category).flat()
      );

      setIngredients(flattenedData.slice(0, 10));
      setShowSpinner(false);
    } catch (error) {
      setError("Failed to fetch ingredients.");
      console.error(error);
      setShowSpinner(false);
    }
  };

  // Fetch ingredients on component mount
  useEffect(() => {
    fetchIngredients();
  }, []);

  return (
    <div>
      <h1>Open Recipes Auth Demo</h1>
      {error && <p>{error}</p>}
      {showSpinner ? (
        <div className="Loader">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : ingredients.length === 0 ? (
        <p>No ingredients found.</p>
      ) : (
        <div style={gridStyle}> {/* Apply grid container styling here */}
          {ingredients.map((ingredient, index) => (
            <div key={index} style={itemBoxStyle}> {/* Style each item box */}
              <h3>{ingredient.name}</h3>
              <p>
                <strong>Category:</strong> {ingredient.category}
              </p>
              <p>
                <strong>Subcategory:</strong> {ingredient.subcategory}
              </p>
              <p>
                <strong>Price:</strong> ${ingredient.current_price.toFixed(2)}
              </p>
              <img
                src={ingredient.clean_image_url}
                alt={ingredient.name}
                style={imageStyle} 
                
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Grid container styling
const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)", // 3 items per row
  gap: "20px", // Space between items
  marginTop: "20px", // Space from the header
};

// Each item box styling
const itemBoxStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  borderRadius: "10px",
  padding: "20px",
  textAlign: "center",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
  height: "300px", // Fixed height to ensure squares
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

// Image styling to ensure it's a square
const imageStyle: React.CSSProperties = {
  width: "100px",
  height: "100px",
  objectFit: "cover",
  margin: "0 auto",
};

export default ProtectedPage;
