import { cn } from "@sca/utils";
import { Group } from "@visx/group";
import { ParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scaleUtc } from "@visx/scale";
import { Bar, Circle, Line } from "@visx/shape";
import { PropsWithChildren, useMemo, useState } from "react";
import { ChartContext, ChartTooltipContext } from "./chart-context";
import {
  ChartProps,
  Datum,
  type ChartContext as ChartContextType,
} from "./types";
import { useTooltip } from "./useTooltip";

type TimeSeriesChartProps<T extends Datum> = PropsWithChildren<ChartProps<T>>;

export function TimeSeriesChart<T extends Datum>(
  props: TimeSeriesChartProps<T>,
) {
  return (
    <ParentSize className="relative">
      {({ width, height }) => {
        return (
          width > 0 &&
          height > 0 && (
            <TimeSeriesChartInner {...props} width={width} height={height} />
          )
        );
      }}
    </ParentSize>
  );
}

function TimeSeriesChartInner<T extends Datum>({
  type = "area",
  width: outerWidth,
  height: outerHeight,
  children,
  data,
  series,
  tooltipContent = (d) => series[0]?.valueAccessor(d).toString() ?? "",
  tooltipClassName = "",
  defaultTooltipIndex = null,
  dateRange,
  margin: marginProp = {
    top: 12,
    right: 5,
    bottom: 32,
    left: 5,
  },
  padding: paddingProp,
}: {
  width: number;
  height: number;
} & TimeSeriesChartProps<T>) {
  const [leftAxisMargin, setLeftAxisMargin] = useState<number>();

  const margin = {
    ...marginProp,
    left: marginProp.left + (leftAxisMargin ?? 0),
  };

  const padding = paddingProp ?? {
    top: 0.1,
    bottom: type === "area" ? 0.1 : 0,
  };

  const width = outerWidth - margin.left - margin.right;
  const height = outerHeight - margin.top - margin.bottom;

  const { startDate, endDate } = useMemo(() => {
    // If dateRange is provided, use it for the scale domain
    // This ensures the chart shows the full selected date range even if data doesn't span all dates
    if (dateRange?.from && dateRange?.to) {
      return {
        startDate: dateRange.from,
        endDate: dateRange.to,
      };
    }
    
    // Otherwise, calculate from data
    const dates = data.map(({ date }) => date);
    if (dates.length === 0) {
      const now = new Date();
      return {
        startDate: now,
        endDate: now,
      };
    }
    const times = dates.map((d) => d.getTime());
    const minIndex = times.indexOf(Math.min(...times));
    const maxIndex = times.indexOf(Math.max(...times));

    return {
      startDate: dates[minIndex] ?? dates[0] ?? new Date(),
      endDate: dates[maxIndex] ?? dates[dates.length - 1] ?? new Date(),
    };
  }, [data, dateRange]);

  const { minY, maxY } = useMemo(() => {
    // Calculate scales based on ACTIVE series only for accurate Y-axis scaling
    // Filter to only active series to get the correct scale for the displayed data
    const activeSeries = series.filter(s => s.isActive);
    const values = (activeSeries.length > 0 ? activeSeries : series)
      .map(({ valueAccessor }) => data.map((d) => valueAccessor(d)))
      .flat()
      .filter((v): v is number => v != null && !isNaN(v) && isFinite(v));

    if (values.length === 0) {
      return { minY: 0, maxY: 1 };
    }

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    // If all values are the same (including all zeros), ensure we have a visible range
    const range = maxValue - minValue;
    let padding: number;
    
    if (range === 0) {
      // If all values are the same (e.g., all 0), create a small visible range
      if (maxValue === 0) {
        // All zeros - show 0 to 1 for visibility
        return { minY: 0, maxY: 1 };
      } else {
        // All same non-zero value - add 10% padding
        padding = Math.max(maxValue * 0.1, maxValue * 0.05);
      }
    } else {
      // Normal range - add 10% padding
      padding = range * 0.1;
    }

    return {
      // Start at 0 for area charts when all values are positive for accurate visualization
      minY: type === "area" && minValue >= 0 ? Math.max(0, minValue - padding) : (type === "area" ? minValue - padding : Math.min(0, minValue - padding)),
      maxY: maxValue + padding,
    };
  }, [data, series, type]);

  const { yScale, xScale } = useMemo(() => {
    const rangeY = maxY - minY;
    return {
      yScale: scaleLinear<number>({
        domain: [
          minY - rangeY * (padding.bottom ?? 0),
          maxY + rangeY * (padding.top ?? 0),
        ],
        range: [height, 0],
        nice: true,
        clamp: true,
      }),
      xScale:
        type === "area"
          ? scaleUtc<number>({
              domain: [startDate, endDate],
              range: [0, width],
            })
          : scaleBand({
              domain: data.map(({ date }) => date),
              range: [0, width],
              padding: Math.min(0.75, (width / data.length) * 0.02),
              align: 0.5,
            }),
    };
  }, [startDate, endDate, minY, maxY, height, width, data.length, type]);

  const chartContext: ChartContextType<T> = {
    type,
    width,
    height,
    data,
    series,
    startDate,
    endDate,
    dateRange: dateRange ?? { from: undefined, to: undefined },
    xScale: xScale as any,
    yScale,
    minY,
    maxY,
    margin,
    padding,
    tooltipContent,
    tooltipClassName,
    defaultTooltipIndex,
    leftAxisMargin,
    setLeftAxisMargin,
  };

  const tooltipContext = useTooltip({
    seriesId: series[0]?.id ?? "",
    chartContext,
    defaultIndex: defaultTooltipIndex ?? undefined,
  });

  const {
    tooltipData,
    TooltipWrapper,
    tooltipLeft,
    tooltipTop,
    handleTooltip,
    hideTooltip,
    containerRef,
  } = tooltipContext;

  return (
    <ChartContext.Provider value={chartContext}>
      <ChartTooltipContext.Provider value={tooltipContext}>
        <svg width={outerWidth} height={outerHeight} ref={containerRef}>
          {children}
          <Group left={margin.left} top={margin.top}>
            {/* Tooltip hover line + circle */}
            {tooltipData &&
              ("bandwidth" in xScale ? (
                <>
                  <Bar
                    x={
                      (xScale(tooltipData.date) ?? 0) -
                      xScale.bandwidth() * xScale.padding()
                    }
                    width={xScale.bandwidth() * (1 + xScale.padding() * 2)}
                    y={0}
                    height={height}
                    fill="black"
                    fillOpacity={0.05}
                  />
                </>
              ) : (
                <>
                  <Line
                    x1={xScale(tooltipData.date)}
                    x2={xScale(tooltipData.date)}
                    y1={height}
                    y2={0}
                    stroke="black"
                    strokeOpacity={0.5}
                    strokeWidth={1}
                  />

                  {series
                    .filter(({ isActive }) => isActive)
                    .map((s) => (
                      <Circle
                        key={s.id}
                        cx={xScale(tooltipData.date)}
                        cy={yScale(s.valueAccessor(tooltipData))}
                        r={4}
                        className={s.colorClassName ?? "text-blue-800"}
                        fill="currentColor"
                      />
                    ))}
                </>
              ))}

            {/* Tooltip hover region */}
            <Bar
              x={0}
              y={0}
              width={width}
              height={height}
              onTouchStart={handleTooltip}
              onTouchMove={handleTooltip}
              onMouseMove={handleTooltip}
              onMouseLeave={hideTooltip}
              fill="transparent"
            />
          </Group>
        </svg>

        {/* Tooltips */}
        <div className="pointer-events-none absolute inset-0">
          {tooltipData && (
            <TooltipWrapper
              key={tooltipData.date.toString()}
              left={(tooltipLeft ?? 0) + margin.left}
              top={(tooltipTop ?? 0) + margin.top}
              offsetLeft={"bandwidth" in xScale ? xScale.bandwidth() + 8 : 8}
              offsetTop={12}
              className="absolute"
              unstyled={true}
            >
              <div
                className={cn(
                  "pointer-events-none rounded-lg border border-neutral-200 bg-white px-4 py-2 text-base shadow-sm",
                  tooltipClassName,
                )}
              >
                {tooltipContent?.(tooltipData) ??
                  series[0]?.valueAccessor(tooltipData) ?? ""}
              </div>
            </TooltipWrapper>
          )}
        </div>
      </ChartTooltipContext.Provider>
    </ChartContext.Provider>
  );
}
