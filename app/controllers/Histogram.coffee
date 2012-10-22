
class Histogram extends Spine.Controller
  name: 'Histogram'
  
  events:
    'change select' : 'draw'
  
  constructor: ->
    super
    console.log 'Histogram'
    
    @render()
    @plot = $("#hdu-#{@index} .histogram .plot")
  
  render: ->
    attrs = {columns: @columns, name: @name}
    @html require('views/plot')(attrs)
  
  draw: (e) ->
    @plot.empty()
    
    values = []
    columnIndex =  e.target.value
    
    dataunit = @hdu.data
    rows = dataunit.rows
    for i in [1..rows]
      row = dataunit.getRow(i - 1)
      values.push(row[columnIndex])
    
    console.log values
    margin =
      top: 20
      right: 20
      bottom: 60
      left: 50
    
    width = @el.innerWidth() - margin.left - margin.right - parseInt(@el.css('padding-left')) - parseInt(@el.css('padding-right'))
    height = @el.innerHeight() - margin.top - margin.bottom - parseInt(@el.css('padding-top')) - parseInt(@el.css('padding-bottom'))
    
    x = d3.scale.linear()
      .range([0, width])
      .domain([0, rows])
    y = d3.scale.linear()
      .range([0, height])
      .domain(d3.extent(values))
      
    xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
    yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
    
    svg = d3.select("#hdu-#{@index} .histogram .plot").append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
          .append('g')
            .attr('transform', "translate(#{margin.left}, #{margin.top})")     
    svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
    svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
    
    svg.selectAll(".bar")
        .data(values)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) -> return x(i))
        .attr("width", x(2) - x(1))
        .attr("y", (d) -> return y(d))
        .attr("height", (d) -> return height - y(d))
        
module.exports = Histogram