import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import './map.css'
// import InventoryIcon from '@mui/icons-material/Inventory';
// import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
// import { Line } from "react-chartjs-2";
import Button from "@mui/material/Button";
// import IconButton from '@mui/material/IconButton';
// import CloseIcon from '@mui/icons-material/Close';
import { CSSTransition } from 'react-transition-group';
import farmIcon from './images/farmhouse.png'
import mustardIcon from './images/mustard.png'
import gingerIcon from './images/ginger.png'
import chiliIcon from './images/chili.png'
import itriGreenhouse from './images/itriGreenhouse.jpg'
// import { toast } from "react-toastify";
import { getRandomNumberBetween, numberWithCommas, isObjectUndefinedOrNull } from "../../../../utils/Helpers";

mapboxgl.accessToken = 'pk.eyJ1IjoicGVlMDgwMyIsImEiOiJja2x0M3d6MTEwc3ZrMnFtcHk0djd4Y3k1In0.CgK7jsTDBrslv1Sg34grpw';

MainMap.propTypes = {
    handleNavigateToDashboard: PropTypes.func
}

export default function MainMap(props) {
    const { handleNavigateToDashboard } = props;

    const filterSelection = [
        {
            id: 1,
            value: "Mustard",
            icon: mustardIcon,
            data: {
                currentStock: [50, 60, 85, 99],
                currentDemand: [33, 55, 68, 88],
                predictStock: [55, 65, 80, 95, 110, 130],
                predictDemand: [30, 50, 70, 90, 104, 119]
            },
            stock: 33546,
            demand: 30034
        },
        {
            id: 2,
            value: "Ginger",
            icon: gingerIcon,
            data: {
                currentStock: [33, 53, 60, 68],
                currentDemand: [33, 25, 35, 51],
                predictStock: [55, 29, 46, 60, 79, 91],
                predictDemand: [30, 36, 45, 55, 70, 89]
            },
            stock: 31458,
            demand: 29543
        },
        {
            id: 3,
            value: "Chili",
            icon: chiliIcon,
            data: {
                currentStock: [60, 89, 105, 120],
                currentDemand: [50, 65, 86, 111],
                predictStock: [55, 78, 90, 130, 154, 169],
                predictDemand: [45, 69, 87, 108, 135, 161]
            },
            stock: 29514,
            demand: 30144
        },
    ]
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(113.567391);
    // const [lng, setLng] = useState(110.32801445137429);
    // const [lat, setLat] = useState(1.588247);
    const [lat, setLat] = useState(2.712088);
    const [zoomValue, setZoomValue] = useState(6.5);
    const [stock, setStock] = useState(numberWithCommas(33546));
    const [demand, setDemand] = useState(numberWithCommas(30034));
    const [options, setOptions] = useState({
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    font: {
                        size: 12,
                    },
                    color: 'white'
                }
            },
            title: {
                display: true,
                color: 'white',
                text: 'Prediction Statistic',
                position: 'bottom',
                font: {
                    size: 20,
                }
            }
        },
        scales: {
            y: {
                // ticks: {
                //     // Include a dollar sign in the ticks
                //     callback: function (value, index, ticks) {
                //         return '$' + value;
                //     }
                // }
            }
        }
    });
    const [selectedOption, setSelectedOption] = useState(1);
    const [isOpen, setIsOpen] = useState(false);
    const [addFormData, setAddFormData] = useState({
        name: '',
        lat: null,
        lng: null,
    })
    const [geoJson, setGeoJson] = useState({
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    "title": "UNIMAS ITRI Lab",
                    "image": itriGreenhouse,
                    "id": 1,
                    "bucket": "greenhouse",
                    "crops": [
                        {
                            "name": "Mustard",
                            "performance": 104,
                            "icon": mustardIcon,
                        },
                        {
                            "name": "Ginger",
                            "performance": 101,
                            "icon": gingerIcon,
                        },
                        {
                            "name": "Chili",
                            "performance": 115,
                            "icon": chiliIcon,
                        },
                    ]
                },
                "geometry": {
                    "coordinates": [
                        110.4289677000,
                        1.4680009000
                    ],
                    "type": "Point"
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "title": "UNIMAS Green House",
                    "image": "https://images.squarespace-cdn.com/content/v1/59765fd317bffcafaf5ff75c/1614627061718-2CQKO2NUYFNZF028VB0Q/greenhouse-PMQM4GS.jpg?format=2500w",
                    "id": 2,
                    "bucket": "greenhouse-Alamshah",
                    "crops": [
                        {
                            "name": "Mustard",
                            "performance": 110,
                            "icon": mustardIcon,
                        },
                        {
                            "name": "Ginger",
                            "performance": 103,
                            "icon": gingerIcon,
                        },
                        {
                            "name": "Chili",
                            "performance": 113,
                            "icon": chiliIcon,
                        },
                    ]
                },
                "geometry": {
                    "coordinates": [
                        110.4532394000,
                        1.4633646000
                    ],
                    "type": "Point"
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "title": "Golden Stem",
                    "image": "https://static.wixstatic.com/media/beaaa8_bbde80b609f14f12a6bdcfe986285fd5~mv2.jpg/v1/fill/w_1132,h_643,al_c,q_90/beaaa8_bbde80b609f14f12a6bdcfe986285fd5~mv2.webp",
                    "id": 3,
                    "bucket": "greenhouse-GoldenStem",
                    "crops": [
                        {
                            "name": "Mustard",
                            "performance": 108,
                            "icon": mustardIcon,
                        },
                        {
                            "name": "Ginger",
                            "performance": 102,
                            "icon": gingerIcon,
                        },
                        {
                            "name": "Chili",
                            "performance": 117,
                            "icon": chiliIcon,
                        },
                    ]
                },
                "geometry": {
                    "coordinates": [
                        110.2228524000,
                        1.4658632000
                    ],
                    "type": "Point"
                }
            },
            {
                "type": "Feature",
                "properties": {
                    "title": "Rampangi",
                    "image": "https://2.bp.blogspot.com/-zVp2iBO5nYo/XMOXqExZW0I/AAAAAAABY_g/8Pdf6R9i7DQ7TE_YUiq8f_1_3maWt1jsACLcBGAs/s1600/rampangi1b.jpg",
                    "id": 4,
                    "bucket": "greenhouse-Rampangi",
                    "crops": [
                        {
                            "name": "Ginger",
                            "performance": 97,
                            "icon": gingerIcon,
                        },
                    ]
                },
                "geometry": {
                    "coordinates": [
                        110.3325959000,
                        1.6735181000
                    ],
                    "type": "Point"
                }
            }
        ]
    });
    const data = (selectedData) => (
        {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
                {
                    label: "Current Stock",
                    data: selectedData.data.currentStock,
                    fill: false,
                    backgroundColor: "rgba(255, 236, 61, 0.2)",
                    borderColor: "rgba(255, 236, 61, 1)",
                    tension: 0.5,
                },
                {
                    label: "Current Demand",
                    data: selectedData.data.currentDemand,
                    fill: false,
                    backgroundColor: "rgba(255, 236, 61, 0.2)",
                    borderColor: "rgba(255, 61, 61, 1)",
                    tension: 0.5,
                },
                {
                    label: "Predict Stock",
                    data: selectedData.data.predictStock,
                    fill: false,
                    backgroundColor: "rgba(64, 255, 70, 0.2)",
                    borderColor: "rgba(64, 255, 70, 1)",
                    tension: 0.5,
                },
                {
                    label: "Predict Demand",
                    data: selectedData.data.predictDemand,
                    fill: false,
                    backgroundColor: "rgba(61, 68, 255, 0.2)",
                    borderColor: "rgba(61, 68, 255, 1)",
                    tension: 0.5,
                }
            ]
        }
    );
    const [selectedData, setSelectedData] = useState(null);

    useEffect(() => {
        if (map.current) return; // initialize map only once

        // if (!localStorage.getItem('locations') || JSON.stringify(geoJson) !== localStorage.getItem('locations')) {
        //     localStorage.setItem('locations', JSON.stringify(geoJson));
        // }

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/pee0803/ckl8smsj409pl17p9wru5y46b",
            center: [lng, lat],
            zoom: zoomValue,
        });

        // map.current.on("load", () => {
        //     map.current.loadImage(
        //         farmIcon,
        //         (error, image) => {
        //             if (error) throw error;
        //             map.current.addImage("farm-icon", image);

        //             map.current.addSource("farmLocations", {
        //                 type: "geojson",
        //                 data: JSON.parse(localStorage.getItem('locations'))
        //             });

        //             map.current.addLayer({
        //                 'id': 'farmLocations',
        //                 'type': 'symbol',
        //                 'source': 'farmLocations',
        //                 'layout': {
        //                     'icon-image': 'farm-icon',
        //                     // get the title name from the source's "title" property
        //                     'text-field': ['get', 'title'],
        //                     'text-font': [
        //                         'Open Sans Semibold',
        //                         'Arial Unicode MS Bold'
        //                     ],
        //                     'text-offset': [0, 2.25],
        //                     'text-anchor': 'top'
        //                 }
        //             });
        //         }
        //     )
        // });

        /* 
            Add an event listener that runs
            when a user clicks on the map element.
        */
        // map.current.on('click', (event) => {
        //     // If the user clicked on one of your markers, get its information.
        //     const features = map.current.queryRenderedFeatures(event.point, {
        //         layers: ['farmLocations'] // replace with your layer name
        //         // layers: geoJson.features
        //     });
        //     if (!features.length) {
        //         return;
        //     }
        //     const feature = features[0];
        //     console.log('feature', feature.properties.id)

        //     const popup = new mapboxgl.Popup({ offset: [0, -15] })
        //         .setLngLat(feature.geometry.coordinates)
        //         .setHTML(
        //             `<h3>${feature.properties.title}</h3>`
        //         )
        //     // .addTo(map.current);
        //     localStorage.setItem('FarmID', feature.properties.id);
        //     localStorage.setItem('bucket', feature.properties.bucket);
        //     setSelectedData(feature.properties);
        // });
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            const number = Number(stock.replace(/,/g, '')) + getRandomNumberBetween(10, 30, 0);
            const costing = Number(demand.replace(/,/g, '')) + getRandomNumberBetween(10, 30, 0);
            setStock(numberWithCommas(number))
            setDemand(numberWithCommas(costing))

            // let performance;
            // performance = getRandomNumberBetween(100, 200, 0);
            // let data = selectedData;
            // if (data) {
            //     JSON.parse(data.crops).map(crop => {
            //         crop.performance = performance;
            //         let abc = { ...selectedData, crops: JSON.stringify(crop) }
            //         console.log(abc)
            //         setSelectedData(abc)
            //     });
            // }
        }, 3000);
        return () => clearTimeout(timer);
    }, [stock, demand])

    const handleChange = (e) => {
        setSelectedOption(e.target.value);
        const changes = filterSelection.find(item => item.id === Number(e.target.value));
        setStock(numberWithCommas(changes.stock))
        setDemand(numberWithCommas(changes.demand))
    }

    const handleAddFarm = () => {
        setIsOpen(!isOpen)
        const value = geoJson
        value.features.push({
            "type": "Feature",
            "properties": {
                "title": addFormData.name,
                "id": geoJson.features.length + 1,
            },
            "geometry": {
                "coordinates": [
                    addFormData.lng,
                    addFormData.lat
                ],
                "type": "Point"
            }
        })
        setGeoJson(value)
        localStorage.setItem('locations', JSON.stringify(value));

        // toast.success(`${addFormData.name} is successfully saved!`, { autoClose: 2000, position: "top-center" })
        setAddFormData({
            name: '',
            lng: null,
            lat: null
        })
        setTimeout(() => {
            window.location.reload(true)
        }, 2000);
    }

    const cardStyle = {
        height: '100%',
        borderRadius: 4,
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#494e54',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px'
    }

    return (
        <div>
            <div ref={mapContainer} className="map-container">
                {/* <div className="d-flex flex-column justify-content-center align-items-center crops-card-container">
                    {filterSelection.map((item, index) => (
                        <div key={index} className='crops-card font-style' style={{ top: 60 * (index + 1) }}>
                            <div className='d-flex justify-content-between align-items-start' style={{ height: '100%' }}>
                                <div>
                                    <div className='row card-container mt-4'>
                                        <div className='col-lg-6 col-md- col-sm-12'>
                                            <Card variant="outlined" sx={cardStyle}>
                                                <CardContent>
                                                    <div className="d-flex justify-content-center align-items-center">
                                                        <div className='card-title'>
                                                            {item.stock}
                                                        </div>
                                                    </div>
                                                    <div className="d-flex justify-content-center align-items-center card-subtitle">
                                                        <InventoryIcon />
                                                        &nbsp;
                                                        Current Stock
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                        <div className='col-lg-6 col-md-6 col-sm-12'>
                                            <Card variant="outlined" sx={cardStyle}>
                                                <CardContent>
                                                    <div className="d-flex justify-content-center align-items-center">
                                                        <div className='card-title'>
                                                            {item.demand}
                                                        </div>
                                                    </div>
                                                    <div className="d-flex justify-content-center align-items-center card-subtitle">
                                                        <ShoppingBagIcon />
                                                        &nbsp;
                                                        Demanding
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                        <div className='col-lg-12 col-md-12 col-sm-12 mt-3'>
                                            <Card variant="outlined" sx={{ height: '100%', borderRadius: 4, backgroundColor: '#494e54', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 4px 12px' }}>
                                                <CardContent>
                                                    <Line data={data(item)} height={4} width={10} options={options} />
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                                <div className='d-flex justify-content-center align-items-center'>
                                    <img src={item.icon} alt={item.value} width='25' height='25' />
                                    &nbsp;
                                    {item.value}
                                </div>
                            </div>
                        </div>
                    )
                    )} */}
                    {/* comment for demo purpose */}
                    {/* <Button variant="contained" style={{ position: 'absolute', bottom: '15px', left: '15px' }} color="error" onClick={(e) => { resetLogonUser() }}>Sign Out</Button> */}
                    {/* <Button
                        variant="contained"
                        style={{ position: 'absolute', bottom: '15px', left: '15px' }}
                        onClick={() => {
                            localStorage.setItem('navigateToDashboard', false)
                            window.location.href = "./"
                        }}
                    >Back To AdminDashboard</Button> */}
                {/* </div> */}
                {/* <div className='d-flex justify-content-between align-items-center app-bar'>
                    <div>
                        <FormControl fullWidth>
                            <InputLabel sx={{ margin: '15px', }} id="subscriptionLabel">Select product</InputLabel>
                            <Select
                                MenuProps={{
                                    style: { zIndex: 9999, color: 'white' }
                                }}
                                sx={{
                                    margin: '15px',
                                    borderRadius: '5px',
                                }}
                                labelId="subscriptionLabel"
                                id="product"
                                value={selectedOption}
                                label="Select product"
                                size="small"
                                onChange={handleChange}
                            >
                                {filterSelection.map((data, index) => {
                                    return (
                                        <MenuItem key={`filter_${index}`} value={data.id}>{data.value}</MenuItem>
                                    )
                                })}
                            </Select>
                        </FormControl>
                    </div>
                    <div style={{ marginRight: '15px' }}>
                        <Button variant="contained" color="primary" onClick={() => setIsOpen(!isOpen)}>Add New Farm</Button>
                        <Button variant="contained" color="warning" onClick={(e) => { resetLogonUser() }}>Sign Out</Button>
                    </div>
                </div> */}
                {/* <CSSTransition
                    in={!isObjectUndefinedOrNull(selectedData)}
                    classNames="example"
                    timeout={300}
                    unmountOnExit
                    onExited={() => setSelectedData(null)}
                >
                    {!isObjectUndefinedOrNull(selectedData) ?
                        <div className='farm-detail-panel font-style'>
                            <div>
                                this ori is commented out
                                <IconButton
                                    className={classes.customHoverFocus}
                                    sx={{ backgroundColor: 'white', marginBottom: '15px' }}
                                    onClick={() => setSelectedData(null)}
                                    aria-label="close"
                                    size='small'
                                >
                                    <CloseIcon />
                                </IconButton>
                                this ori is commented out
                                <img src={selectedData.image} alt={selectedData.title} width='auto' height='200px' />
                                <div className='farm-panel-title'>
                                    {selectedData.title}
                                </div>
                                <div>
                                    <p className='farm-panel-subtitle'>Performance:</p>
                                    {JSON.parse(selectedData.crops).map((item, index) => (
                                        <div className='d-flex justify-content-between align-items-center my-3 farm-panel-data'>
                                            <div className='d-flex align-items-center'>
                                                <img src={item.icon} alt={item.name} width='25px' height="25px" />
                                                &nbsp;
                                                <div>
                                                    {item.name}
                                                </div>
                                            </div>
                                            <div>
                                                {item.performance}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button variant='contained' color='primary' onClick={() => handleNavigateToDashboard()}>
                                View details
                            </Button>
                        </div>
                        :
                        <div />
                    }
                </CSSTransition> */}
            </div>

            {/* <Dialog open={isOpen} onClose={() => setIsOpen(!isOpen)} fullScreen>
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                            Add New Location
                        </Typography>
                        <Button startIcon={<SaveIcon />} autoFocus color="inherit" onClick={() => handleAddFarm()}>
                            save
                        </Button>
                    </Toolbar>
                </AppBar>
                <DialogContent>
                    <MapJS geoJson={geoJson} setAddFormData={setAddFormData} addFormData={addFormData} />
                </DialogContent>
            </Dialog> */}
        </div>
    )
}