import { Tooltip, Typography } from "@mui/material";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { Product } from "./types";

interface ProductCarouselProps {
  products: Product[];
}
export const MultiProductCarousel: React.FC<ProductCarouselProps> = ({ products }) => {
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };
  return <Carousel responsive={responsive}
    showDots={true}
    infinite={true}
    autoPlay={true}
    autoPlaySpeed={5000}

  >
    {products.map((product) => {
      return <div style={{padding:"5px"}}>
        <span style={{textDecoration:"line-through", color:"red"}}>
          ${product.Selling_Price}
        </span> &nbsp;
        <span style={{color:"green"}}>
          ${(product.Selling_Price - product.Selling_Price * product.Discount_Percent / 100).toFixed(2)}
        </span>
        <Tooltip title={product.Product_Name} >
          <Typography noWrap overflow={"hidden"} textOverflow={"ellipsis"}
          >{product.Product_Name}</Typography>
        </Tooltip>


        <img src={product.Image.split('|')[0]} alt={product?.Product_Name}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', padding:"10px" }}
        />
      </div>
    })}

  </Carousel>;
}