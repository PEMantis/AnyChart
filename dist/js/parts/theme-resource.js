if(!_.theme_resource){_.theme_resource=1;(function($){$.xa($.y.anychart.themes.defaultTheme,{resource:{calendar:{},conflicts:{labels:{enabled:!0,anchor:"left-top",hAlign:"center",fontSize:"8pt",padding:0,fontColor:"#F4F4F4",format:"{%hours}h ({%percent}%)"},fill:"#dd2c00",stroke:"none",hatchFill:null,height:15,zIndex:100},overlay:{enabled:!1},activities:{labels:{enabled:!0,anchor:"left-top",fontColor:"#F4F4F4",format:"{%name} ({%hoursPerDayRounded}h)",position:"left-top"},hoverLabels:{enabled:null},selectLabels:{enabled:null},fill:"#1976d2",hoverFill:$.nG,
selectFill:"#333",stroke:null,hoverStroke:$.hG,selectStroke:$.hG,hatchFill:!1,hoverHatchFill:null,selectHatchFill:null},resourceList:{oddFill:"none",evenFill:"none",enabled:!0,width:"100%",height:"100%",background:{enabled:!0,fill:"#F3F7FA",stroke:"none",cornerType:"none",corners:0},images:{borderRadius:10,opacity:1,align:"none",fittingMode:"meet",size:"25%",margin:{top:5,right:0,bottom:5,left:5}},baseSettings:{margin:{top:2,right:0,bottom:3,left:5},fontSize:15,textOverflow:"...",fontFamily:'"Helvetica Neue","Helvetica",sans-serif'},
names:{margin:{top:5,right:0,bottom:3,left:5},fontSize:17,fontWeight:"bold",fontColor:"#000"},types:{fontSize:10,fontColor:"#212121"},descriptions:{fontSize:12,fontColor:"#959CA0",fontWeight:"bold"},tags:{fontSize:9,fontColor:"#212121",background:{enabled:!0,fill:"#eee",stroke:"#ccc",cornerType:"round",corners:4},padding:5,margin:{top:2,right:0,bottom:3,left:5}},drawTopLine:!1,drawRightLine:!1,drawBottomLine:!0,drawLeftLine:!1,stroke:"#ccc",zIndex:2,overlay:!0},logo:{enabled:!0,fill:"#E7ECF0",stroke:"none",
bottomStroke:"#ccc",zIndex:2,overlay:!1},timeLine:{enabled:!0,background:{enabled:!1},overlay:{enabled:!1},zIndex:2,vAlign:"middle",hAlign:"center",textOverflow:"",fill:"none",stroke:"#ccc",padding:[2,10,2,10],fontSize:11,fontWeight:"bold",fontFamily:'"Helvetica Neue", Helvetica, sans-serif',drawTopLine:!1,drawRightLine:!1,drawBottomLine:!0,drawLeftLine:!1},grid:{overlay:{enabled:!1},background:{enabled:!1,fill:"#F3F7FA"},oddFill:"#fff",evenFill:"#fff",oddHolidayFill:"#F4F4F4 .7",evenHolidayFill:"#F4F4F4 .7",
oddHatchFill:null,evenHatchFill:null,oddHolidayHatchFill:null,evenHolidayHatchFill:null,horizontalStroke:"#ccc",verticalStroke:"#ccc",drawTopLine:!1,drawRightLine:!1,drawBottomLine:!0,drawLeftLine:!1,zIndex:2},xScale:{minimumGap:.01,maximumGap:.01},horizontalScrollBar:{enabled:!0,allowRangeChange:!1,autoHide:!0,orientation:"bottom",thumbs:!1,fill:null,zIndex:1010},verticalScrollBar:{enabled:!0,allowRangeChange:!1,autoHide:!0,orientation:"right",thumbs:!1,fill:null,zIndex:1010},zoomLevels:[{id:"days",
levels:[{unit:"day",count:1,formats:["MMM\ndd  EEEE"],format:function(){return this.value.toUpperCase()},hAlign:"left"}],unit:"day",count:1,unitPixSize:220},{id:"weeks",levels:[{unit:"day",count:1,formats:["dd EEE","dd"],hAlign:"left",fill:"#fff",fontColor:"#ABB6BC",format:function(){return this.value.toUpperCase()},height:30},{unit:"week",count:1,formats:["w MMM"],fill:"#F0F5F8",format:function(){return this.value.toUpperCase()}}],unit:"day",count:1,unitPixSize:100},{id:"months",levels:[{unit:"day",
count:1,formats:["d EEE","d"],hAlign:"center",padding:[2,5,2,5],fill:"#fff",format:function(){return this.value.toUpperCase()},height:30},{unit:"week",count:1,formats:["w MMM"],fill:"#F0F5F8",format:function(){return this.value.toUpperCase()}}],unit:"day",count:1,unitPixSize:25}],zoomLevel:0,padding:0,margin:20,resourceListWidth:260,timeLineHeight:52,cellPadding:[2,2,2,2],minRowHeight:50,pixPerHour:25,defaultMinutesPerDay:60,splitterStroke:"#ccc",timeTrackingMode:"activity-per-resource",background:{enabled:!0,
stroke:"#ccc"},tooltip:{allowLeaveScreen:!1,allowLeaveChart:!0,displayMode:"single",positionMode:"float",title:{enabled:!0,fontSize:13},separator:{enabled:!0},titleFormat:"{%name}",format:function(){return"Starts: "+$.wr(this.start)+"\nEnds: "+$.wr(this.end)}}}});
$.xa($.y.anychart.themes.defaultTheme.standalones,{resourceList:{width:"33%",height:"100%",background:{enabled:!0,fill:"#ccc",stroke:"#ccc",cornerType:"none",corners:0},rowHeight:null,minRowHeight:"20%",maxRowHeight:"50%",images:{borderRadius:10,opacity:1,align:"none",fittingMode:"meet",size:"25%",margin:{top:5,right:0,bottom:5,left:5}},baseSettings:{margin:{top:2,right:0,bottom:3,left:5},fontSize:15,textOverflow:"..."},names:{margin:{top:5,right:0,bottom:3,left:5}},types:{fontSize:10,fontColor:"#212121"},
descriptions:{fontSize:12,fontColor:"#545f69",fontStyle:"oblique"},tags:{fontSize:9,fontColor:"#212121",background:{enabled:!0,fill:"#eee",stroke:"#ccc",cornerType:"round",corners:4},padding:5,margin:{top:2,right:0,bottom:3,left:5}}}});})($)}
