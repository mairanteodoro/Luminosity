'use strict';

angular.module('LuminosityApp')
  .directive('hexagonal', function (WorkspaceService, $timeout) {
    return {
      templateUrl: '/views/hexagonal.html',
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        var aspectRatio, margin, x, y, xAxis, yAxis, 
            svg, color, hexbin, chartEl, xAxisEl, yAxisEl,
            width, height, index, hasData, xExtent, yExtent,
            clipPathEl, groupEl;
        
        hasData = false;
        
        // Angular constant?
        aspectRatio = 9 / 16;
        
        // Set margin for D3 chart
        margin = {top: 10, right: 30, bottom: 20, left: 40};
        
        // Create axes
        x = d3.scale.linear();
        y = d3.scale.linear();
        xAxis = d3.svg.axis().orient('bottom');
        yAxis = d3.svg.axis().orient('left');
        
        // Create colormap
        color = d3.scale.linear()
            .domain([0, 1000])
            .range(["white", "steelblue"])
            .interpolate(d3.interpolateLab);
        
        // Create SVG elements
        svg = d3.select(element[0]).append('svg');
        chartEl = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
        clipPathEl = chartEl.append('clipPath')
            .attr('id', 'clip')
          .append('rect')
            .attr('class', 'mesh');
        groupEl = chartEl.append('g')
              .attr("clip-path", "url(#clip)")
        
        xAxisEl = chartEl.append('g').attr('class', 'x axis');
        yAxisEl = chartEl.append('g').attr('class', 'y axis');
        
        // Listen for when chart element is ready
        scope.$on('chart-added', function() {
          $timeout(function() {
            
            // Get width and compute height
            width = element[0].offsetWidth;
            height = width * aspectRatio;
            element[0].style.height = height + 'px';
            
            // Get new width and height
            width = width - margin.left - margin.right;
            height = height - margin.top - margin.bottom;
            
            // Update axes
            x.range([0, width]);
            y.range([height, 0]);
            
            xAxis.scale(x);
            yAxis.scale(y);
            
            // Update SVG attributes
            svg
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom);
            
            clipPathEl
              .attr('width', width)
              .attr('height', height);
            
            chartEl.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
            xAxisEl.attr('transform', 'translate(0,' + height + ')').call(xAxis);
            yAxisEl.call(yAxis);
            
            // TODO: Update axes if we have data
            
          }, 0);
        });
        
        // Watch for model change on scope
        index = parseInt(attrs.index);
        scope.$watch('axes.' + index, function() {
          var axis1, axis2, points;
          
          axis1 = scope.axes[index].axis1;
          axis2 = scope.axes[index].axis2;
          if (!axis1 || !axis2)
            return;
          
          WorkspaceService.getTwoColumns(axis1, axis2, function(data) {
            
            // Get min and max
            xExtent = d3.extent(data, function(d) { return d[axis1]; });
            yExtent = d3.extent(data, function(d) { return d[axis2]; });
            
            // Set axes domains and transition
            x.domain(xExtent).range([0, width]);
            y.domain(yExtent).range([height, 0]);
            
            xAxis.scale(x);
            yAxis.scale(y);
            
            xAxisEl.transition().duration(500).call(xAxis);
            yAxisEl.transition().duration(500).call(yAxis);
            
            // Create hexbin object
            hexbin = d3.hexbin()
                      .size([width, height])
                      .radius(20)
                      .x(function(d) { return x(d[axis1]); })
                      .y(function(d) { return y(d[axis2]); });
            
            groupEl.selectAll('.hexagon')
                .data(hexbin(data))
              .enter().append("path")
                .attr('class', 'hexagon')
                .attr('d', hexbin.hexagon())
                .attr('transform', function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                .style("fill", function(d) { return color(d.length); });
            
            hasData = true;
            
          });
        }, true);
        
        // Broadcast that chart element is ready
        scope.$emit('chart-ready');
      }
      
    };
  });
