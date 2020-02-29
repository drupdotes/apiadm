var labelType, useGradients, nativeTextSupport, animate;

(function ($, Drupal, drupalSettings) {

  'use strict';

// don't use behaviour for now as it runs init several times leading to a massive triple store calls
//  Drupal.behaviors.mybehavior = {
//    attach: function (context, settings) {
//      
//    console.log(drupalSettings.wisski_jit, context, settings);
//    }
//  };
  Drupal.behaviors.mybehavior = {
    attach: function (context, settings) {
    $(function(){
      /* 
      $(document).on('click', '.ui-dialog-titlebar-close', function(){
          console.log("modal close");
          $("#wki-infoswitch").on('change', function(){
          //  init($, Drupal, drupalSettings, drupalSettings.wisski_jit);
          }); 
        
          //init($, Drupal, drupalSettings, drupalSettings.wisski_jit);
        
      });
      
      $("#wki-infoswitch").on('change',function(){
        alert($("#wki-infoswitch option:selected").val());
        init($, Drupal, drupalSettings, drupalSettings.wisski_jit);
        });
      */
      init($, Drupal, drupalSettings, drupalSettings.wisski_jit);
   
   }); 
    }
  };
})(jQuery, Drupal, drupalSettings);

(function() {
  var ua = navigator.userAgent,
    iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
    typeOfCanvas = typeof HTMLCanvasElement,
    nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
    textSupport = nativeCanvasSupport 
      && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
  //I'm setting this based on the fact that ExCanvas provides text support for IE
  //and that as of today iPhone/iPad current text support is lame
  labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
  nativeTextSupport = labelType == 'Native';
  useGradients = nativeCanvasSupport;
  animate = !(iStuff || !nativeCanvasSupport);
})();

var Log = {
  elem: false,
  write: function(text){
    if (!this.elem) 
      this.elem = document.getElementById('wki-infolog');
    this.elem.innerHTML = text;
    //    this.elem.style.left = (500 - this.elem.offsetWidth / 2) + 'px';
  }
};


function init($, Drupal, drupalSettings, nodeid){
  console.log("init gestartet");
   
  //alert(nodeid);
  var state = $("#wki-infoswitch option:selected").val();
  //alert(state);
  var url = drupalSettings.path.baseUrl + "jit/json/" 
                                        + state 
                                        + "/" 
                                        + encodeURIComponent(nodeid).replace(/%2F/g, "/"); //"http://wisski.gnm.de/dev/jit/json/" + nodeid;
  
  //var Circles = $jit.Canvas.Background.Circles;
  /*  
  $jit.Canvas.Background.FilledCircles = new Class({
    //'filled': {
    
      alert("hellO");  
      initialize: function(viz, options) {
        $jit.Canvas.Background.Circles.initialize(viz, options);     
      },
      
      resize: function(width, height, base) {
       $jit.Canvas.Background.FilledCircles.resize(width, height, base);
      },
      
      plot: function(base) {
        var canvas = base.canvas,
        ctx = base.getCtx(),
        conf = this.config,
        styles = conf.CanvasStyles;
        //set canvas styles
        for(var s in styles) ctx[s] = styles[s];
        var n = conf.numberOfCircles,
        rho = conf.levelDistance;
        ctx.beginPath();
        ctx.arc(0, 0, rho * n, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(217, 244, 156 ,0.2)' ;
        ctx.fill();
        ctx.closePath();

        for(var i=1; i<=n; i++) {
          if(i%2==1){
            ctx.beginPath();
            ctx.arc(0, 0, rho * i - rho/2, 0, 2 * Math.PI, false);
            ctx.lineWidth = rho;
            ctx.strokeStyle = 'rgba(192, 230, 108,0.2 )';
            ctx.stroke();
            ctx.closePath();
          }
        }   
      }//plot 
  //} 
  });
  */
  
  
  

  
  // Implementing a new EdgeType for edge label support 
  $jit.RGraph.Plot.EdgeTypes.implement({
    'labeled': {
      'render': function(adj, canvas) {
        this.edgeTypes.line.render.call(this, adj, canvas);
        var data = adj.nodeTo.data['labeltext'];
        if(adj.nodeTo.data['labeltext']) {
          var ctx = canvas.getCtx();
          var posFr = adj.nodeFrom.pos.getc(true);
          var posTo = adj.nodeTo.pos.getc(true);
          
          /*
           Calculate the angle of the edge according to angle =  Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI 
           (as well as  x = rho * cos(theta) and y = rho * sin(theta) for polar coordinates)
          */
          
          
          // To receive a angle using polar coordinates use this:
          
          /*
           var thetaFr = adj.nodeFrom.pos.getp().theta;
           var thetaTo = adj.nodeTo.pos.getp().theta;
           var rhoFr = adj.nodeFrom.pos.getp().rho;
           var rhoTo = adj.nodeTo.pos.getp().rho;
           var angle = Math.atan2(rhoTo * Math.sin(thetaTo) - rhoFr * Math.sin(thetaFr) , 
             rhoTo * Math.cos(thetaTo) - rhoFr * Math.cos(thetaFr)) * 180 / Math.PI;
          */
       
          // here we use complex pos 
          var angle =  Math.atan2(posFr.y - posTo.y, posTo.x - posFr.x) * 180 / Math.PI;
          
          // Angle ranges between PI and -PI thus we have to add 2 PI in case of -PI to receive
          // a range between 0 and 2 PI
          if (angle < 0)
            angle = angle + 360;
          //alert(angle + " " + data );
          
          //Now we have to rotate the canvas
          //Always save the initial canvas context in advance of the next rotation
          ctx.save();
          //translate fixed point of the rotation to the middle of the corresponding edge
          ctx.translate((posFr.x + posTo.x) / 2, (posFr.y + posTo.y) / 2);

         
        ///* 
          //Rotation and alignment of labels depend on the particular quadrant
          //Having edges with 0° resp. 360° labels are naturally aligned/in correct position by default
          
          //I.Quadrant(0-90°)
          if ( angle > 0 && angle <= 90 ) {
            ctx.rotate( -angle * Math.PI / 180);
          //II.Quadrant(90-180°)       
          } if ( angle > 90 && angle <= 180 ) {
            ctx.rotate( -( angle - 180 ) * Math.PI / 180 );
          //III.Quadrant(180-270°)            
          } if ( angle > 180 && angle <= 270 ) {
            ctx.rotate( -( angle - 180 ) * Math.PI / 180 );
          //IV.Quadrant(270-360°)              
          } if ( angle > 270 && angle < 360 ) {
            ctx.rotate( -( angle - 360 ) * Math.PI / 180 );
                    
          }
        //*/
         //@Todo: fillStyle hardcoded -> change
         ctx.fillStyle = "#144C88";
         ctx.textAlign = "center";
         ctx.fillText(data, 0, 0 );
         
         //Always restore the initial canvas context we saved 
         //at the beginning for the next rotation
         ctx.restore();
            
        }// if data
      }
    }
  });


  //console.log('init', url);
  $.getJSON(url, function(json) {
    //json = JSON.parse(json);
    console.log(JSON.stringify(json));  
    console.log(url);
    //init RGraph
    var rgraph = new $jit.RGraph({
      //Where to append the visualization

      injectInto: 'wki-infovis', 
      // Optional: create a background canvas that plots
      // concentric circles.
      background: {
       //type: 'FilledCircles'
       //,
        CanvasStyles: {
          strokeStyle: 'rgb(208,208,208)'
        },
        // Distance of concentric circles
        levelDistance: 80   
        },
      // Distance of nodes
      levelDistance: 80,
      //Add navigation capabilities:
      //zooming by scrolling and panning.
      Navigation: {
        enable: true,
        panning: true,
        zooming: 20
      },
      //Set Node and Edge styles.
      Node: {
        color: 'rgb(143, 71, 13)',
        dim: 6
      },
        
      Edge: {
        //overridable: true,
        color: 'rgba(143, 71, 13 ,0.8)',
        lineWidth: 1.5,
        alpha: 0.8,
        'type': 'labeled'
      },

      onBeforeCompute: function(node){
      //Log.write("centering " + node.name + "...");
      //$jit.id('wki-infolist').innerHTML = node.data.relation;
            
      },
        
      onAfterCompute: function(){
      //Log.write("done");
      },
      //Add the name of the node in the correponding label
      //and a click handler to move the graph.
      //This method is called once, on label creation.
      onCreateLabel: function(domElement, node){
        domElement.innerHTML = node.name;
        domElement.ondblclick = function() {
 	  window.location.href = node.id;
        };
        domElement.onclick = function(){
        //alert("click" + node.name);
          $.ajaxSetup({"error":function() {
	    rgraph.onClick(node.id);
            }
          });
  	  var uri = node.id;
	  //var elem = uri.split("/");
	  //var url = "http://wisski.gnm.de/dev/jit/json/" + elem[elem.length -1];
	  var state = $("#wki-infoswitch option:selected").val();
	  //var url = Drupal.settings.basePath + "jit/json/" + state + "/" + encodeURIComponent(elem[elem.length -1]);
	  var url = drupalSettings.path.baseUrl + "jit/json/" 
	                                        + state 
	                                        + "/" 
	                                        + encodeURIComponent(nodeid) 
	                                        + "?target_uri=" 
	                                        + encodeURIComponent(node.id);					
	  Log.write(url);
          //alert(url);
	  //alert(JSON.stringify(node));
	  var my_JSON_object = {};
          //console.log("json 124", url);          
          $.getJSON(url, function(jsonstring) {
            //alert("alert");
            //Log.write(url);
            //Log.write(jsonstring);
            console.log(url);
	    json = jsonstring;
	    //load JSON data
            //rgraph.loadJSON(json);
	    rgraph.op.sum(json, {
	      type:"fade",
              duration:250,
              fps: 25,
              hideLabels: false,
              transition: $jit.Trans.Quart.easeOut 
	    });

            //rgraph.refresh(true);
    	    //end
   	    //append information about the root relations in the right column
	    rgraph.graph.getNode(rgraph.root).data.relation = json.data.relation;
	    $jit.id('wki-infolist').innerHTML = rgraph.graph.getNode(rgraph.root).data.relation;
            //$jit.id('wki-infolist').innerHTML = json.data.relation;							
            rgraph.onClick(node.id);
	  });
        };
      },
      //Change some label dom properties.
      //This method is called each time a label is plotted.
      onPlaceLabel: function(domElement, node){
        var style = domElement.style;
        style.display = '';
        style.cursor = 'pointer';
        /*
         if (node._depth <= 1) {
           style.fontSize = "0.8em";
           style.color = "rgb(64,64,64)";         
         } else if(node._depth == 2) {
           style.fontSize = "0.8em";
           style.color = "rgb(128,128,128)";    
         } else {
           //style.display = 'none';
           style.fontSize = "0.8em";
           style.color = "rgb(192,192,192)";
         }
        */
      

        style.fontSize = "0.8em";
        style.color = "rgb(192,192,192)";
        var left = parseInt(style.left);
        var w = domElement.offsetWidth;
        style.left = (left - w / 2) + 'px';
      },
      
      //Add tooltips  
      Tips: {  
        enable: true,  
      onShow: function(tip, node) {  
        var html = "<div class=\"tip-title\">" + node.id + "</div>";   
        var data = node.data;  
        if("days" in data) {  
          html += "<b>Last modified:</b> " + data.days + " days ago";  
        } if("size" in data) {  
            html += "<br /><b>File size:</b> " + Math.round(data.size / 1024) + "KB";  
        } tip.innerHTML = html;  
      }  
    }
  });
		
  $("#wki-infoswitch").change(function() {
    
    //alert("waaaah!");
    var uri = rgraph.graph.getNode(rgraph.root).id;
    //var elem = uri.split("/");
    var state = $("#wki-infoswitch option:selected").val();
    var url = drupalSettings.path.baseUrl + "jit/json/" 
                                          + state 
                                          + "/" 
                                          + nodeid; // encodeURIComponent(uri).replace(/%2F/g, "/");		
    //alert(url);
    //alert(JSON.stringify(node));
    var my_JSON_object = {};
    //console.log("json 214", url);          
    $.getJSON(url, function(jsonstring) {
      //alert("alert");
      //alert(jsonstring);
      //json = JSON.parse(jsonstring);
      json = jsonstring;
      //load JSON data
      rgraph.loadJSON(json);
      //trigger small animation
      rgraph.graph.eachNode(function(n) {
        var pos = n.getPos();
        //pos.setc(-200, -200);
        pos.setc(0,0);
      });
      rgraph.compute('end');
      rgraph.fx.animate({
        modes:['polar'],
        duration: 1600
      });
      //end
      //append information about the root relations in the right column
      rgraph.graph.getNode(rgraph.root).data.relation = json.data.relation;
      $jit.id('wki-infolist').innerHTML = rgraph.graph.getNode(rgraph.root).data.relation;
      //$jit.id('wki-infolist').innerHTML = json.data.relation;		
    });
  });
  
  //Open Modal View Handler clearing the previous canvas and disconnecting change event handler
  $("#modallink").on('click', function(){
    console.log("Oi!");
    /*
    rgraph.canvas.clear();
    rgraph.loadJSON({});
    */
    $("#wki-infovis").html("");
    $("#wki-infolist").html("");
    $("#wki-infolog").html(""); 
    $("#wki-infoswitch").off("change");
  });

  //load JSON data
  rgraph.loadJSON(json);
  //trigger small animation
  rgraph.graph.eachNode(function(n) {
    var pos = n.getPos();
    //pos.setc(-200, -200);
    pos.setc(0,0);
  });
  rgraph.compute('end');
  rgraph.fx.animate({
    modes:['polar'],
    duration: 1600
  });
  //end
  //append information about the root relations in the right column
  $jit.id('wki-infolist').innerHTML = rgraph.graph.getNode(rgraph.root).data.relation;
});

//	$("#wki-infoswitch").change(function() {
//		alert("waaaah!");
//		var meineid = "bla";
//		alert(meineid);		
//alert(" bla " + rgraph.graph.getNode(rgraph.root).id);
//  	alert("alles doof!");	
//	init(rgraph.graph.getNode(rgraph.root).id);
//	});
}
