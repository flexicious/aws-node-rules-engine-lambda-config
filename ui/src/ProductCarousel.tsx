import * as React from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { Product } from './types';
import { Tooltip } from '@mui/material';

interface ProductCarouselProps {
    products: Product[];
}
export const ProductCarousel: React.FC<ProductCarouselProps> = ({ products }) => {
    const theme = useTheme();
    const [activeProduct, setActiveProduct] = React.useState(0);
    const maxSteps = products.length;

    const handleNext = () => {
        setActiveProduct((prevActiveProduct) => prevActiveProduct + 1);
    };

    const handleBack = () => {
        setActiveProduct((prevActiveProduct) => prevActiveProduct - 1);
    };

    return (
        <Box sx={{ maxWidth: 400, flexGrow: 1 }}>
            <Paper
                square
                elevation={0}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    height: 50,
                    pl: 2,
                    bgcolor: 'background.default',
                }}
            >
                <Tooltip title={products[activeProduct]?.Product_Name} >

                    <Typography noWrap overflow={"hidden"} textOverflow={"ellipsis"}
                    >{products[activeProduct]?.Product_Name}</Typography>
                </Tooltip>


            </Paper>
            <Box sx={{ height: 150, maxWidth: 400, width: '100%', pt: 2, pb: 2 }}>
                <img src={products[activeProduct]?.Image.split('|')[0]} alt={products[activeProduct]?.Product_Name}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
            </Box>
            <MobileStepper
                steps={maxSteps}
                position="static"
                activeStep={activeProduct}
                nextButton={
                    <Button
                        size="small"
                        onClick={handleNext}
                        disabled={activeProduct === maxSteps - 1}
                    >
                        Next
                        {theme.direction === 'rtl' ? (
                            <KeyboardArrowLeft />
                        ) : (
                            <KeyboardArrowRight />
                        )}
                    </Button>
                }
                backButton={
                    <Button size="small" onClick={handleBack} disabled={activeProduct === 0}>
                        {theme.direction === 'rtl' ? (
                            <KeyboardArrowRight />
                        ) : (
                            <KeyboardArrowLeft />
                        )}
                        Back
                    </Button>
                }
            />
        </Box>
    );
}