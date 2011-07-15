/**
 * A script for management of drawed menu.
 * 
 * Uses canvas. See http://developer.apple.com/documentation/AppleApplications/Reference/SafariJSRef/Classes/Canvas.html
 * for documentation.
 * 
 * 
 */


/*
 * Class for base childs and it's children,  manages opener clicks
 * 
 * @param {Object} baseContainer - obj of base child container
 * @param {Object} canvasCont - obj of canvas cont
 * @param {Object} canvasRoot - obj of canvas root
 */

function MNBaseContainer(baseContainer, canvasCont, canvasRoot){
	var _baseContainer, _canvasCont, _canvasRoot;
	_baseContainer = baseContainer;
	_canvasCont = canvasCont;
	_canvasRoot = canvasRoot;
	
	if (!_canvasCont.length || !_canvasRoot.length){
		throw new Error("canvas for container or for root not set. Initialization of base Child failed");
	}
	
	var BaseCont = this;
	
	var horizontalPosition;
	var baseChildContainerCoordinates = _baseContainer.offset();
	baseChildContainerCoordinates = {
		left: baseChildContainerCoordinates.left - MN.data.baseContainerCoordinates.left
	};
	
	if (baseChildContainerCoordinates.left > MN.data.rootCenterCoordinates.left){
		horizontalPosition = MN.constants.relativeHorizontalPosition.right;
	}else{
		horizontalPosition = MN.constants.relativeHorizontalPosition.left;
	}
	
	//horizontal position is inherited from base child horizontal position,
	//but vertical relative position - by parent label top position.
	var relativePositioning = {
		horizontalPosition: horizontalPosition,
		getVerticalPositionTopParentNode: function(){
			//return MN.data.rootCoordinates.top + MN.data.rootDimensions.height;
			return MN.data.rootCenterCoordinates.top;
		}
	};

	this.reDrawCanvasCont = function(){
		BaseCont.fullReloadTree();
	};
	
	//init derived childs:
	
	var allChildsTree = new MNContainer({
		baseContainer: _baseContainer,
		callback: BaseCont.reDrawCanvasCont,
		relativePositioning: relativePositioning,
		isBaseChild: true
	});
	
	this.fullReloadTree = function(){
		//clear canvas:
		BaseCont.clearCanvasCont();
		
		//visual arange elements:
		allChildsTree.RootDependentArrange();
		
		allChildsTree.RecalculateVerticalPosition();
		BaseCont.depthRedrawCanvasCont({
			childNode: allChildsTree
		});
	};
	
	//visual arange elements:
	allChildsTree.SelfArrange();
	
	//hide nodes with mnPlus:
	allChildsTree.setStatusOpenClose();
	allChildsTree.RootDependentArrange();
	allChildsTree.RecalculateVerticalPosition();
		
		
	var labelCoordinates = allChildsTree.GetLabelCoordinates();
	var labelDimensions = allChildsTree.GetLabelDimensions();
	var blockHorizontalPosition = allChildsTree.GetblockHorizontalPosition();
	var blockVerticalPosition = allChildsTree.GetblockVerticalPosition();

	
	//draw canvas:
	//sfericity 50%
	var labelRelativeCenterDistance = 0;
	if (blockHorizontalPosition == MN.constants.relativeHorizontalPosition.right){
		labelRelativeCenterDistance = labelCoordinates.left;
	}else{
		labelRelativeCenterDistance = labelCoordinates.left + labelDimensions.width;
	}
	
	var distortion = Math.abs((labelRelativeCenterDistance
		- MN.data.rootCenterCoordinates.left) / MN.constants.canvasStyle.devider);
	
	var canvasLineWidth = MN.constants.canvasStyle.lineWidth;
	var lineWidthDistorsion = canvasLineWidth / 2;
	
	//arrange canvasRoot:
	var canvasRootWidth = Math.abs(labelCoordinates.left - MN.data.rootCenterCoordinates.left) + canvasLineWidth;
	
	if (blockHorizontalPosition == MN.constants.relativeHorizontalPosition.left){
		canvasRootWidth -= labelDimensions.width;
	}

		
	var labelRelativeTopPosition;
	switch(MN.constants.nodesArrangement.current) {
		case MN.constants.nodesArrangement.bottom:
			labelRelativeTopPosition = labelCoordinates.top + labelDimensions.height;
			break;
		case MN.constants.nodesArrangement.center:
			labelRelativeTopPosition = labelCoordinates.top + labelDimensions.height/2;
			break;
	}
	
	_canvasRoot.css({
		top: Math.min(labelRelativeTopPosition,
			MN.data.rootCenterCoordinates.top)-lineWidthDistorsion,
		left: Math.min(MN.data.rootCenterCoordinates.left,
			labelCoordinates.left + labelDimensions.width)-1
	}).width(canvasRootWidth);
	
	
	var canvasRootHeight = Math.abs(MN.data.rootCenterCoordinates.top - labelRelativeTopPosition) 
		+ canvasLineWidth;
	
	_canvasRoot.height(canvasRootHeight);
	
	_canvasRoot.attr({
		"width": canvasRootWidth,
		"height": canvasRootHeight
	});
	
	_canvasRootDraw = _canvasRoot[0].getContext('2d');
	_canvasRootDraw.lineWidth = MN.constants.canvasStyle.lineWidth;
	_canvasRootDraw.strokeStyle = MN.constants.canvasStyle.lineColor;
	_canvasRootDraw.lineCap = MN.constants.canvasStyle.lineCap;
	_canvasRootDraw.beginPath();
	
	
	//if label is on right:	
	if (blockHorizontalPosition == MN.constants.relativeHorizontalPosition.right){
		
		if (blockVerticalPosition == MN.constants.relativeVerticalPosition.top){
			//from left bottom to right top
			_canvasRootDraw.moveTo(0, canvasRootHeight);
		    _canvasRootDraw.quadraticCurveTo(
				canvasRootWidth - distortion,
				0,
				canvasRootWidth,
				lineWidthDistorsion);
		}
		else{
			//from left top to right bottom
			_canvasRootDraw.moveTo(0, 0);
		    _canvasRootDraw.quadraticCurveTo(
				canvasRootWidth - distortion,
				canvasRootHeight,
				canvasRootWidth,
				canvasRootHeight-lineWidthDistorsion);
		}
	    
	}
	else{
		
		if (blockVerticalPosition == MN.constants.relativeVerticalPosition.top){
			//from right bottom to left top
			_canvasRootDraw.moveTo(canvasRootWidth-canvasLineWidth, canvasRootHeight-lineWidthDistorsion);
		    _canvasRootDraw.quadraticCurveTo(
				0 + distortion,
				lineWidthDistorsion,
				0,
				lineWidthDistorsion);
		}
		else{
			//from right top to left bottom
			_canvasRootDraw.moveTo(canvasRootWidth, 0);
		    _canvasRootDraw.quadraticCurveTo(
				0 + distortion,
				canvasRootHeight,
				0,
				canvasRootHeight-lineWidthDistorsion);
		}
	}
	
	_canvasRootDraw.stroke();
	
	//arrange canvasCont:
	
	var dims = allChildsTree.GetFullTreeDimensions();
	dims.height += canvasLineWidth;
	
	this.canvasContDims = dims;
	
	var contPos = allChildsTree.GetContainerPosition();
	this.canvasContPos = contPos;
	
	_canvasCont.css({
		top: contPos.top,
		left: contPos.left
	}).width(dims.width);
	
	_canvasCont.height(dims.height);
	
	_canvasCont.attr({
		"width": dims.width,
		"height": dims.height
	});
	
	//draw canvas cont:
	this.canvasContDraw = _canvasCont[0].getContext('2d');
	
	this.clearCanvasCont = function(){
		
		this.canvasContDraw.beginPath();
		this.canvasContDraw.moveTo(0, 0);
		this.canvasContDraw.clearRect(0, 0, this.canvasContDims.width,
			this.canvasContDims.height);
		this.canvasContDraw.stroke();
	};
	
	this.depthRedrawCanvasCont = function(data){
		
		var _canvasContDraw = this.canvasContDraw;
		_canvasContDraw.lineWidth = MN.constants.canvasStyle.lineWidth;
		_canvasContDraw.strokeStyle = MN.constants.canvasStyle.lineColor;
		_canvasContDraw.lineCap = MN.constants.canvasStyle.lineCap;
		var contPos  = this.canvasContPos;
		_canvasContDraw.beginPath();
		
		var defparams = {
			childNode: null
		};
		
		var params = $.extend({}, defparams, data);
		
		var childlabelDimensions = params.childNode.GetLabelDimensions();
		
		var childLabelCoordinates = params.childNode.GetLabelCoordinates();

		
		var depthPosition = {
			top: childLabelCoordinates.top- contPos.top,
			left: childLabelCoordinates.left- contPos.left
		};
		

		var labelRelativeTopPosition;
		switch(MN.constants.nodesArrangement.current) {
			case MN.constants.nodesArrangement.bottom:
				labelRelativeTopPosition = childlabelDimensions.height
				 	+ depthPosition.top;
				break;
			case MN.constants.nodesArrangement.center:
				labelRelativeTopPosition = childlabelDimensions.height/2
				 	+ depthPosition.top;
				break;
		}
		
		//base canvas cont position:
		_canvasContDraw.moveTo(depthPosition.left, 
			labelRelativeTopPosition
			 );
		
	    _canvasContDraw.lineTo(
			childlabelDimensions.width 
				+ depthPosition.left,
			labelRelativeTopPosition
			);
		
		if (params.childNode.hasVisibleChildren){
			
			_canvasContDraw.stroke();
			
			$.each(params.childNode.children, function(){
				
				BaseCont.depthRedrawCanvasCont({
					childNode: this
				});
				var childContainerPosition = this.GetContainerPosition();
				var childLabelDimensions = this.GetLabelDimensions();
				
				var currLabelCoordinates = this.GetLabelCoordinates();
				
				var childCanvasDistorsion;
				
				var childHorRelativePos = this.GetblockHorizontalPosition();
				
				var currChildPosition = {
						top: currLabelCoordinates.top- contPos.top,
						left: currLabelCoordinates.left- contPos.left
					};
				
				var childLabelRelativeTopPosition;
				
				switch(MN.constants.nodesArrangement.current) {
					case MN.constants.nodesArrangement.bottom:
						childLabelRelativeTopPosition = currChildPosition.top 
										+ childLabelDimensions.height;
						break;
					case MN.constants.nodesArrangement.center:
						childLabelRelativeTopPosition =currChildPosition.top 
										+ childLabelDimensions.height/2;
						break;
				}
		
				if (childHorRelativePos == MN.constants.relativeHorizontalPosition.right){

					childCanvasDistorsion = (childContainerPosition.left
					- childlabelDimensions.width) / MN.constants.canvasStyle.devider;
					
					_canvasContDraw.moveTo(
						childlabelDimensions.width 
							+ depthPosition.left,
						labelRelativeTopPosition
						);
					
					_canvasContDraw.quadraticCurveTo(
							currChildPosition.left 
								- childCanvasDistorsion,
							childLabelRelativeTopPosition,
							currChildPosition.left,
							childLabelRelativeTopPosition);
				}
				else{
					
					childCanvasDistorsion = (
						childLabelCoordinates.left -
					  (currLabelCoordinates.left + childLabelDimensions.width)) / MN.constants.canvasStyle.devider;
					
					_canvasContDraw.moveTo(
							depthPosition.left,
							labelRelativeTopPosition
						);
					
					_canvasContDraw.quadraticCurveTo(
							currChildPosition.left 
								+ childLabelDimensions.width
								+ childCanvasDistorsion,
							childLabelRelativeTopPosition,
							currChildPosition.left 
								+ childLabelDimensions.width,
							childLabelRelativeTopPosition);
								
				}
				
				_canvasContDraw.stroke();
			});
		}
		
		//draw line for nodes that are base childs but don't have visible children:
		if (params.childNode.isBaseChild && !params.childNode.hasVisibleChildren){
			_canvasContDraw.stroke();
		}
	};
	
	this.depthRedrawCanvasCont({
		childNode: allChildsTree
	});
}

/*
 * MNContainer is a node - contains
 *  opener (plus/ minus)
 *  label
 *  children
 * 
 * @param {Object} params = settings
 * 	callback - function to call when "opener" is clicked
 * 	isBaseChild - is current node base child.
 * 	relative positioning - left/right, top/ bottom - necessary for drawing
 */
function MNContainer(params){
	var defaultParams = {
		baseContainer: null,
		callback: null,
		isBaseChild: false,
		relativePositioning: {
			horizontalPosition: MN.constants.relativeHorizontalPosition.right,
			getVerticalPositionTopParentNode: function(){
				return MN.data.rootCenterCoordinates.top;
			}
		}
	};
	
	var settings = $.extend({}, defaultParams, params);
	
	var _baseContainer = settings.baseContainer;
	
	var _isBaseChild = settings.isBaseChild;
	
	this.isBaseChild  = _isBaseChild;
	
	
	var label = _baseContainer.find(" > div.mnLabel");
	
	var labelName = label.find(" > div.labelTitle").text();
	
	var labelCoordinates = label.offset({ border: true, 
		padding: true });
	
	var labelDimensions = {
		height: label.outerHeight({ margin: true }),
		width: label.outerWidth({ margin: true })
	};

	var blockVerticalPosition;

	function recalculateLabelCoordinates(){
		//label coordinates inside of base container:
		labelCoordinates = label.offset({ border: true, 
			padding: true });
		labelCoordinates = {
			left: labelCoordinates.left - MN.data.baseContainerCoordinates.left,
			top: labelCoordinates.top - MN.data.baseContainerCoordinates.top
		};
	}
	
	recalculateLabelCoordinates();
	
	var blockHorizontalPosition = settings.relativePositioning.horizontalPosition;
	
	//opener:
	var opener = _baseContainer.find(" > div.mnOpenerIcon");

	var mnChildren = _baseContainer.find(" > div.mnChildren");
	
	var childContainers = mnChildren.find(" > div.mnContainer");
	var childs = [];
	this.children = childs;
	var CurrentChild = this;
	
	this.GetLabelCoordinates = function(){
		return labelCoordinates;
	};
	this.GetLabelName = function(){
		return labelName;
	};
	
	if (childContainers.length){
		//init all childs of current node
		childContainers.each(function(i, elem){
			childs.push(new MNContainer({
				baseContainer: $(elem),
				callback: settings.callback,
				isBaseChild: false,
				relativePositioning: {
					horizontalPosition: blockHorizontalPosition,
					getVerticalPositionTopParentNode: function(){
						//labelCoordinates.top
						var _labelCoordinates = CurrentChild.GetLabelCoordinates();
						
						var labelRelativeTopPosition;
						switch(MN.constants.nodesArrangement.current) {
							case MN.constants.nodesArrangement.bottom:
								labelRelativeTopPosition = _labelCoordinates.top 
									+ CurrentChild.GetLabelDimensions().height;
								break;
							case MN.constants.nodesArrangement.center:
								labelRelativeTopPosition = _labelCoordinates.top 
											+ CurrentChild.GetLabelDimensions().height/2;
								break;
						}
						
						return labelRelativeTopPosition;
					}					
				}
			}));
		});
	}
	else{
		mnChildren.hide();
		opener.hide();
	}
	
	var hasChildren = childContainers.length;
	
	var isOpened;
	
	var openerSign = MN.constants.openerSigns.minus;
	
	this.hasVisibleChildren = hasChildren;
	
	this.setStatusOpenClose = function setStatusOpenClose(forceGetStatus){
		//on first call, forse it to get all childs dimentions.
		//after that call it to hide nodes with mnPlus class
		
		if (hasChildren){
			$.each(this.children, function(){
				this.setStatusOpenClose(forceGetStatus);
			});
		}
		if (forceGetStatus){
			isOpened = true;
		}
		else{
			isOpened = opener.is(".mnMinus");
		}
		
		this.hasVisibleChildren  = hasChildren && isOpened;

		if (!isOpened && hasChildren){
			openerSign = MN.constants.openerSigns.plus;
		}
		
		if (!isOpened){
			mnChildren.hide();
		}
	
	};
	
	this.setStatusOpenClose(true);
	
	if (hasChildren){
		//bind opener events
		opener.click(function(){
			if (isOpened){
				mnChildren.hide();
				CurrentChild.hasVisibleChildren = false;
				openerSign = MN.constants.openerSigns.plus;
				opener.addClass("mnPlus").removeClass("mnMinus");
				if (settings.callback){
					settings.callback();
				}
				isOpened = false;
			}else{
				mnChildren.show();
				CurrentChild.hasVisibleChildren = true;
				openerSign = MN.constants.openerSigns.minus;
				opener.addClass("mnMinus").removeClass("mnPlus");
				if (settings.callback){
					settings.callback();
				}
				isOpened = true;
			}
		}).bind("mouseenter", function(){
			if (openerSign == MN.constants.openerSigns.minus){
				opener.addClass("openerMinusHover");
			}
			else{
				opener.addClass("openerPlusHover");
			}
		}).bind("mouseleave", function(){
			if (openerSign == MN.constants.openerSigns.minus) {
				opener.removeClass("openerMinusHover");
			}
			else{
				opener.removeClass("openerPlusHover");
			}
			
		}).bind("mousedown", function(){
			if (openerSign == MN.constants.openerSigns.minus) {
				opener.removeClass("openerMinusHover").addClass("openerMinusMouseDown");
			}
			else{
				opener.removeClass("openerPlusHover").addClass("openerPlusMouseDown");
			}
			
		}).bind("mouseup", function(){
			if (openerSign == MN.constants.openerSigns.minus) {
				opener.removeClass("openerMinusMouseDown");
			}
			else{
				opener.removeClass("openerPlusMouseDown");
			}
		});
	}
	
	
	this.SetLabelPosition= function(position){

		var labelRelativeHeight;
		switch(MN.constants.nodesArrangement.current) {
			case MN.constants.nodesArrangement.bottom:
				labelRelativeHeight = labelDimensions.height;
				break;
			case MN.constants.nodesArrangement.center:
				labelRelativeHeight = labelDimensions.height/2;
				break;
		}
		
		
		var moveToBottom;
		
		/*if (position.top >= labelRelativeHeight){
			moveToBottom = position.top 
				- labelRelativeHeight ;
			
		}else{
			moveToBottom =  (position.top 
				- labelRelativeHeight) ;
		}*/
		
		moveToBottom = position.top 
				- labelRelativeHeight ;
				
		label.css({
			left: position.left,
			top: this.hasVisibleChildren ? moveToBottom: 0
		});
		recalculateLabelCoordinates();
	};
	this.SetLabelTopPosition= function(nTop){
		//change label top position to accoding to childs total dimension
		var labelRelativeHeight;
		switch(MN.constants.nodesArrangement.current) {
			case MN.constants.nodesArrangement.bottom:
				labelRelativeHeight = labelDimensions.height;
				break;
			case MN.constants.nodesArrangement.center:
				labelRelativeHeight = labelDimensions.height/2;
				break;
		}
		
		var moveToBottom;
		
		/*if (nTop  > labelRelativeHeight){
			moveToBottom = nTop
				- labelRelativeHeight ;
			
		}else{
			moveToBottom = - (nTop
				- labelRelativeHeight);
		}*/

		moveToBottom = nTop
				- labelRelativeHeight ;
				
		label.css({
			top: this.hasVisibleChildren ? moveToBottom: 0
		});
		recalculateLabelCoordinates();
	};
	this.SetOpenerPosition= function(){
		//arrange opener position
		var labelPosition = label.position();
	
		var openerPosition;
		
		var labelRelativeHeight;
		switch(MN.constants.nodesArrangement.current) {
			case MN.constants.nodesArrangement.bottom:
				labelRelativeHeight = labelDimensions.height;
				break;
			case MN.constants.nodesArrangement.center:
				labelRelativeHeight = labelDimensions.height/2;
				break;
		}

	
		if (blockHorizontalPosition == MN.constants.relativeHorizontalPosition.right) {
			
			openerPosition = {
				left: labelPosition.left + labelDimensions.width - 1,
				top: labelPosition.top + labelRelativeHeight
					- opener.height() / 2
			};
		}
		else{
			openerPosition = {
				left: labelPosition.left - 7,
				top: labelPosition.top + labelRelativeHeight
					- opener.height() / 2
			};
		}
		
		opener.css(openerPosition);
	};
	
	
	this.GetLabelDimensions = function(){
		return labelDimensions;
	};
	this.GetblockHorizontalPosition = function(){
		return blockHorizontalPosition;
	};
	this.GetblockVerticalPosition = function(){
		return blockVerticalPosition;
	};
	
	var fullTreeDimensions = null;
	this.GetFullTreeDimensions = function(){
		return fullTreeDimensions;
	};
	
	this.GetDimensions = function(){
		//get dimensions of container
		var height = 0;
		var width = 0;
		
		if (this.hasVisibleChildren){
			$.each(this.children, function(){
				var dims = this.GetDimensions();
				
				height += dims.height;
				
				var childWidth = dims.width;
				if (childWidth > width){
					width = childWidth;
				}
			});
			width += this.getOpenerWidth();
		}
		
		var containerDimensions = {
			height: Math.max(height, labelDimensions.height),
			width: labelDimensions.width + width
		};
		
		return containerDimensions;
	};
	
	this.SetContainerPosition = function(position){
		_baseContainer.css({
			top: position.top,
			left: position.left
		});
	};
	this.SetContainerLeftPosition = function(leftPosition){
		_baseContainer.css({
			left: leftPosition
		});
	};
	this.SetContainerTopPosition= function(nTop){
		_baseContainer.css({
			top: nTop
		});
	};
	this.AddContainerTopPosition= function(nTop){
		var currTop = this.GetContainerPosition().top;
		_baseContainer.css({
			top: currTop + nTop
		});
	};
	this.GetContainerPosition = function(){
		return _baseContainer.position();
	};
	this.GetLabelPosition = function(){
		return label.position();
	};
	this.ArrangeAndGetDimensions = function(position){
		
		this.SetContainerPosition({
			top: position.top,
			left: position.left
		});
		
		return this.GetDimensions();
	};
	this.RootDependentArrangeAndGetDimensions = function(nTop){
		
		this.SetContainerTopPosition(nTop);
		
		return this.GetDimensions();
	};
	this.getOpenerWidth = function(){
		return 20;
	};
	this.RecalculateVerticalPosition = function(){
		//recalculate vertical position, from position.top of parent node
		if (this.hasVisibleChildren){
			$.each(this.children, function(){
				this.RecalculateVerticalPosition();
			});
		}
		//recalculation:
		recalculateLabelCoordinates();
		
		var labelRelativeTopPosition;
		switch(MN.constants.nodesArrangement.current) {
			case MN.constants.nodesArrangement.bottom:
				labelRelativeTopPosition = labelCoordinates.top + labelDimensions.height;
				break;
			case MN.constants.nodesArrangement.center:
				labelRelativeTopPosition = labelCoordinates.top + labelDimensions.height/2;
				break;
		}
		if (labelRelativeTopPosition
				< settings.relativePositioning.getVerticalPositionTopParentNode()) {
			blockVerticalPosition = MN.constants.relativeVerticalPosition.top;
		}
		else{
			blockVerticalPosition = MN.constants.relativeVerticalPosition.bottom;
		}
	};
	
	this.SelfArrange = function(){
		//base function for arranging nodes. Get maximum dimensions for setting canvas cont dimensions.
		var moveChildsToRight = 
			(blockHorizontalPosition == MN.constants.relativeHorizontalPosition.left) ?
				0 : labelDimensions.width + this.getOpenerWidth(); 

		var position = {
			top: 0,
			left: moveChildsToRight
		};
		var maxChildWidth = 0;
		
		if (this.hasVisibleChildren){
			$.each(this.children, function(){
				this.SelfArrange();
				
				var childDimensions = this.ArrangeAndGetDimensions({
					top: position.top,
					left: position.left
				});
				
				position.top += childDimensions.height;
				if (childDimensions.width > maxChildWidth){
					maxChildWidth = childDimensions.width;
				}
			});
			
			if (blockHorizontalPosition == MN.constants.relativeHorizontalPosition.left){
				$.each(this.children, function(){
					var dim = this.GetDimensions();
					
					if (dim.width < maxChildWidth){
						var diff = maxChildWidth - dim.width;
						
						this.SetContainerLeftPosition(diff);
					}
				});
			}
		}
		else{
			
			position.top = labelDimensions.height;
		}
		
		var moveLabelToRight;
		if (blockHorizontalPosition == MN.constants.relativeHorizontalPosition.left){
			moveLabelToRight = maxChildWidth;
			if (this.hasVisibleChildren){
				moveLabelToRight += this.getOpenerWidth();
			}
		}
		else{
			moveLabelToRight = 0;
		}
		
		_baseContainer.css({
				width: labelDimensions.width + 
					(blockHorizontalPosition == MN.constants.relativeHorizontalPosition.left ?
						moveLabelToRight : maxChildWidth),
				height: Math.max(position.top, labelDimensions.height)
			});
		
		//comparing half of height
		if (this.hasVisibleChildren){
			position.top /=2;
		}
			
		this.SetLabelPosition({
				top: position.top,
				left: moveLabelToRight
			});	
		this.SetOpenerPosition();
		
		if (_isBaseChild){
			fullTreeDimensions = this.GetDimensions();
		}
	};
	
	this.RootDependentArrange = function(){
		//arange only top positions for non-base childs
		//and container dimensins for all:
		
		var position = {
			top: 0
		};
		var maxChildWidth = 0;
		
		if (this.hasVisibleChildren){
			$.each(this.children, function(){
				this.RootDependentArrange();
				
				var childDimensions = 
					this.RootDependentArrangeAndGetDimensions(position.top);
				
				position.top += childDimensions.height;
				if (childDimensions.width > maxChildWidth){
					maxChildWidth = childDimensions.width;
				}
			});
			
		}
		else{
			position.top =labelDimensions.height;
		}
		
		var moveLabelToRight = 0;
		if (blockHorizontalPosition == MN.constants.relativeHorizontalPosition.left){
			moveLabelToRight = maxChildWidth;
			if (this.hasVisibleChildren){
				moveLabelToRight += this.getOpenerWidth();
			}
		}
		
		_baseContainer.css({
				width: labelDimensions.width + 
					(blockHorizontalPosition == MN.constants.relativeHorizontalPosition.left ?
						moveLabelToRight : maxChildWidth),
				height: Math.max(position.top, labelDimensions.height)
			});
			
		if (this.hasVisibleChildren){
			position.top /=2;
		}
		
		if (!_isBaseChild){
			this.SetLabelTopPosition(position.top);	
			this.SetOpenerPosition();
		}
		else
			if (this.hasVisibleChildren)
		 {
			
			var allHeight = 0;
			$.each(this.children, function(){
				allHeight += this.GetDimensions().height;
			});
			
			var baseLabelTop = this.GetLabelPosition().top;
			var baseLabelHeight = this.GetLabelDimensions().height;
			
			var labelRelativeTopPosition;
			switch(MN.constants.nodesArrangement.current) {
				case MN.constants.nodesArrangement.bottom:
					labelRelativeTopPosition = baseLabelHeight + baseLabelTop - allHeight / 2;
					break;
				case MN.constants.nodesArrangement.center:
					labelRelativeTopPosition = baseLabelHeight / 2 + baseLabelTop - allHeight / 2;
					break;
			}
			
			$.each(this.children, function(){
				this.AddContainerTopPosition(labelRelativeTopPosition);
			});
		}
	};
	return this;
}


/*
 * Management class.
 * It get's all data from html, initiates nodes.
 * It is called from document.ready: MN.init()
 * 
 */
var MN = {
	constants: {
		baseContainerId: "mnBaseContaiener",
		baseChildClass: "mnBaseChildren",
		rootId: "mnRoot",
		contCanvasPrefix: "cnCont",
		rootCanvasPrefix: "cnRoot",
		relativeHorizontalPosition: {
			left: "left",
			right: "right"
		},
		relativeVerticalPosition: {
			top: "top",
			bottom: "bottom"
		},
		openerSigns : {
			minus: "minus",
			plus: "plus"
		},
		//personalization goes here:
		
		canvasStyle: {
			lineWidth: 2,	//from 1 to ... look ok with 1, 2.
			lineColor: "#EB9C41",	//line color 
			lineCap: 'round',	//end of line. look in documentation link - on top of this page
			devider: 2	//maximum sfericity - 1, if bigger sfericity is smaller. Default 2
		},
		nodesArrangement:{
			bottom: "bottom",
			center: "center",
			current: null
		}
	},
	elems:{
		baseContainer: null,
		root: null,
		baseChilds: null
	},
	data:{
		rootCenterCoordinates: null,
		baseContainerCoordinates: null,
		rootCoordinates: null,
		rootDimensions:{
			height: 0,
			width: 0
		}
	},
	init: function MN_Init(){
		MN.constants.nodesArrangement.current = MN.constants.nodesArrangement.center;

		//get base elements and dimensions
		MN.elems.baseContainer = $("#" + MN.constants.baseContainerId);
		MN.elems.root = $("#" + MN.constants.rootId);
		//collection of base childs
		MN.elems.baseChilds = MN.elems.baseContainer
			.find("." + MN.constants.baseChildClass);
		
		var rootCoordinates = MN.elems.root.offset({ border: true, 
			padding: true });
		var rootDimensions = {
			height: MN.elems.root.outerHeight({ margin: true }),
			width: MN.elems.root.outerWidth({ margin: true })
		};
		
		MN.data.rootDimensions.height = rootDimensions.height;
		MN.data.rootDimensions.width = rootDimensions.width;
		
		MN.data.rootCoordinates = rootCoordinates;
		
		MN.data.baseContainerCoordinates = MN.elems.baseContainer.offset({ border: true, 
			padding: true });
		
		//root center coordinates
		MN.data.rootCenterCoordinates = {
			top: rootCoordinates.top + rootDimensions.height / 2
				- MN.data.baseContainerCoordinates.top,
			left: rootCoordinates.left+ rootDimensions.width / 2 
					- MN.data.baseContainerCoordinates.left
		};
			
		//init collection of base childs
		
		MN.elems.baseChilds.each(function(i, elem){
			var currBaseChild = $(elem);
			var numBaseChild = currBaseChild.attr("id").split("_")[1];
			
			
			var contCanvas = $("#"+MN.constants.contCanvasPrefix 
					+ numBaseChild);
			
			var rootCanvas = $("#"+MN.constants.rootCanvasPrefix
					+ numBaseChild);
					
			var baseChild = new MNBaseContainer(currBaseChild, 
				contCanvas, rootCanvas);

		});
		
	}
};

$(document).ready(function(){
 	
	  MN.init();
});
