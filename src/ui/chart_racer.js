export class ChartRacer {
  // コンストラクタで categoryColors を受け取る
  constructor(config, data, categoryColors) {
    this.config = config;
    this.data = data;
    this.categoryColors = categoryColors; // プロパティとして保持
    this.defaultColor = '#CCCCCC';      // デフォルト色を定義
    this.chart = null;
    this.stopped = true;
    this.timer = null;
    this.currentDate = this.config.startDate;
  }

  init() {
    this._renderChart();
  }

  _renderChart() {
    const chartOptions = {
      debug: true,
      width: 600,
      type: 'horizontal column solid',
      animation: { duration: 500 },
      margin: { top: 0, right: 50, bottom: 0, left: 0 },
      defaultPoint: { label_text: '%id: <b>%yvalue</b>' },
      defaultSeries: { legendEntry_visible: false, mouseTracking_enabled: false },
      series: this._makeSeries(),
      annotations: [{ id: 'year', label: { text: this._formatAnnotation(new Date(this.config.startDate)) }, position: 'inside right' }],

      // 設定をメソッド呼び出しに置き換え
      title: this._buildTitleOptions(),
      yAxis: this._buildYAxisOptions(),
      xAxis: this._buildXAxisOptions(),
      legend: this._buildLegendOptions(),
      toolbar: this._buildToolbarOptions(),
    };

    this.chart = JSC.chart('chartDiv', chartOptions, (c) => {
      this._playPause(false, c);
    });
  }

  _buildTitleOptions() {
    return { position: 'center', label: { margin_bottom: 40, text: this.config.title } };
  }

  _buildYAxisOptions() {
    return { scale_range: { padding: 0.1, min: 0 }, orientation: 'opposite', overflow: 'hidden' };
  }

  _buildXAxisOptions() {
    return { defaultTick_enabled: false, scale: { invert: true }, alternateGridFill: 'none' };
  }

  _buildLegendOptions() {
    return {
      template: '%icon %name',
      position: 'inside top right',
      layout: 'vertical',
      margin_top: 50,
      customEntries: Object.keys(this.categoryColors).map(key => ({ name: key, icon: { color: this.categoryColors[key] } }))
    };
  }

  _buildToolbarOptions() {
    return {
      defaultItem: { position: 'inside top', offset: '0,-65', boxVisible: false, margin: 6 },
      items: {
        startLabel: { type: 'label', label_text: new Date(this.config.startDate).getFullYear().toString() },
        slider: {
          type: 'range',
          width: 240,
          debounce: 200,
          value: new Date(this.config.startDate).getTime(),
          min: new Date(this.config.startDate).getTime(),
          max: new Date(this.config.endDate).getTime(),
          events_change: (val) => {
            this._moveSlider(val);
            this._playPause(true);
          }
        },
        endLabel: { type: 'label', label_text: new Date(this.config.endDate).getFullYear().toString() },
        Pause: {
          type: 'option',
          value: false,
          width: 50,
          margin: [6, 6, 6, 16],
          icon_name: 'system/default/pause',
          label_text: 'Pause',
          events_change: () => {
            this._playPause(!this.stopped);
          }
        }
      }
    };
  }

  _makeSeries() {
    const dateStr = this.currentDate;
    const filteredData = this.data.filter(item => {
      const value = item[dateStr];
      const hasValidItem = item.item && item.item.trim() !== '';
      return hasValidItem && value && value > 0;
    });

    filteredData.sort((a, b) => b[dateStr] - a[dateStr]);

    return [{
      points: filteredData.map((item, index) => ({
        x: index,
        id: item.item,
        y: item[dateStr],
        color: this.categoryColors[item.category] || this.defaultColor
      }))
    }];
  }

  _moveSlider(date, cb) {
    const dt = new Date(date);
    this.currentDate = JSC.formatDate(new Date(dt.getFullYear(), dt.getMonth(), 1), 'yyyy/MM/dd');

    this.chart.annotations('year').options({ label_text: this._formatAnnotation(dt) });
    this.chart.uiItems('slider').options({ value: dt.getTime() });

    this.chart.series(0).options({ points: this._makeSeries()[0].points }, { then: cb });
  }

  _animateChart() {
    if (!this.stopped) {
      this.timer = setTimeout(() => {
        const dt = new Date(this.currentDate);
        const newDate = dt.setMonth(dt.getMonth() + 1);
        if (newDate >= new Date(this.config.endDate).getTime()) {
          clearTimeout(this.timer);
          this._playPause(true);
        } else {
          this._moveSlider(newDate, () => this._animateChart());
        }
      }, this.config.frameDelay);
    }
  }

  _playPause(val, chrt) {
    const c = chrt || this.chart;
    if (val) {
      if (!this.stopped) {
        c.uiItems('Pause').options({ label_text: 'Play', icon_name: 'system/default/play' });
        clearTimeout(this.timer);
        this.stopped = true;
      }
    } else {
      if (this.stopped) {
        c.uiItems('Pause').options({ label_text: 'Pause', icon_name: 'system/default/pause' });
        this.stopped = false;
        this._animateChart();
      }
    }
  }

  _formatAnnotation(dt) {
    const year = dt.getFullYear();
    const month = dt.toLocaleString('ja-JP', { month: 'short' });
    return (
      `<span style="font-size:20px; font-weight:bold; width:20px; vertical-align:middle">${month}</span>` +
      `<span style="font-size:40px; font-weight:bold; width:130px; align:right;">${year}</span><br>` +
      `合計販売数:<br>` +
      `<span style="font-size:24px; font-weight:bold; width:180px;margin:0 0 0 -2px">{%sum:n0}</span>`
    );
  }
}
