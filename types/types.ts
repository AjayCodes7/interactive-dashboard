export type ThresholdRule = {
    color: string;
    operator: "<" | "<=" | ">" | ">=" | "=";
    value: number;
};

export type PolygonData = {
    coords: [number, number][];
    dataSource: string;
    color: string;
    weatherData?: any;
};

export type TimelineSliderProps = {
    startDate: Date;
    setStartDate: (date: Date) => void;
    endDate: Date;
    setEndDate: (date: Date) => void;
    resolution: "hourly" | "daily";
    setResolution: (res: "hourly" | "daily") => void;
    activeTimeIndex: number;
    setActiveTimeIndex: (index: number) => void;
};

export type LatLngExpression = [number, number];
