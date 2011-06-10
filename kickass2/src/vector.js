var Vector = new Class({
	/*
		Constructor:
			initialize
		
		Parameters:
			(mixed) x - If x is an object, it can be any object with x and y-properties,
							otherwise it will be assigned as the x-property of the vector
			(number) y - The y-value.
	*/
	initialize: function(x, y) {
		if ( typeof x == 'Object' ) {
			this.x = x.x;
			this.y = x.y;
		} else {
			this.x = x;
			this.y = y;
		}
	},

	/*
		Method:
			cp
		
		Make a copy of the Vector.
		
		Returns:
			A Vector witht the same x and y-property
	*/
	
	cp: function() {
		return new Vector(this.x, this.y);
	},
	
	/*
		Method:
			mul
		
		Scale the Vector by a factor.
		
		Returns:
			this - For chaining
	*/

	mul: function(factor) {
		this.x *= factor;
		this.y *= factor;
		return this;
	},
	
	/*
		Method:
			mulNew
		Same as Vector.mul, but operates on a copy which it returns.
	*/

	mulNew: function(factor) {
		return new Vector(this.x * factor, this.y * factor);
	},
	
	/*
		Method:
			add
		
		Add one vector on to another.
		
		Parameters:
			vec - Any object with an x and y-property. Will add those respectively
		
		Returns:
			this - For chaining
	*/

	add: function(vec) {
		this.x += vec.x;
		this.y += vec.y;
		return this;
	},

	/*
		Method:
			addNew
		Same as Vector.add, but operates on a copy which it returns.
	*/

	addNew: function(vec) {
		return new Vector(this.x + vec.x, this.y + vec.y);
	},
	
	/*
		Method:
			sub
		
		Subtract one vector from another.
		
		Parameter:
			vec - The vector to subtract from this, any object with x and y-property
		
		Returns:
			this - For chaining
	*/

	sub: function(vec) {
		this.x -= vec.x;
		this.y -= vec.y;
		return this;
	},

	/*
		Method:
			subNew
		Same as Vector.subNew, but operates on a copy which it returns.
	*/
	
	subNew: function(vec) {
		return new Vector(this.x - vec.x, this.y - vec.y);
	},

	/*
		Method:
			rotate
		
		Rotate the vector given an angle in radians. (Rotates around the 
		center of the coordinate system)
		
		Parameters:
			angle - The angle in radians to rotate by
		
		Returns: this - for chaining
	*/
	
	rotate: function(angle) {
		var x = this.x, y = this.y;
		this.x = x * Math.cos(angle) - Math.sin(angle) * y;
		this.y = x * Math.sin(angle) + Math.cos(angle) * y;
		return this;
	},

	/*
		Method:
			rotateNew
		Same as Vector.rotate, but operates on a copy which it returns.
	*/
	
	rotateNew: function(angle) {
		return this.cp().rotate(angle);
	},

	/*
		Method:
			setAngle
		
		Set the angle of the vector in the coordinate system.
		
		Parameters:
			angle - The angle in radians
		
		Returns: this - for chaining
	*/
	
	setAngle: function(angle) {
		var l = this.len();
		this.x = Math.cos(angle) * l;
		this.y = Math.sin(angle) * l;
		return this;
	},

	/*
		Method:
			setAngleNew
		Same as Vector.setAngle, but operates on a copy which it returns.
	*/
	
	setAngleNew: function(angle) {
		return this.cp().setAngle(angle);
	},
	
	/*
		Method:
			setLength
		
		Set the length of the vector. Angle will be the same.
		
		Parameters:
			length - The new length of the vector
		
		Returns: this - for chaining
	*/

	setLength: function(length) {
		var l = this.len();
		if ( l ) this.mul(length / l);
		else this.x = this.y = length;
		return this;
	},
	
	/*
		Method:
			setLengthNew
		Same as Vector.setLength, but operates on a copy which it returns.
	*/

	setLengthNew: function(length) {
		return this.cp().setLength(length);
	},

	/*
		Method:
			normalize
		
		Normalize the vector (turn it into unit-length, a length of one)
		
		Returns: this - for chaining
	*/

	normalize: function() {
		var l = this.len();
		if ( l == 0 )
			return this;
		this.x /= l;
		this.y /= l;
		return this;
	},

	/*
		Method:
			normalizeNew
		Same as Vector.normalize, but operates on a copy which it returns.
	*/

	normalizeNew: function() {
		return this.cp().normalize();
	},
	
	/*
		Method:
			angle
		
		Get the angle of the vector. (Uses Math.atan2 if of interest)
		
		Returns:
			The angle of the vector in radians.
	*/

	angle: function() {
		return Math.atan2(this.y, this.x);
	},
	
	/*
		Method:
			collidesWith
		
		Test if the vector collides with a rectangle. A point-in-rect-test.
		
		Parameters:
			rect - An object with x, y, width and height properties.
		
		Returns:
			true if in rect, otherwhise false. Must be inside, not on the edge.
	*/

	collidesWith: function(rect) {
		return this.x > rect.x && this.y > rect.y && this.x < rect.x + rect.width && this.y < rect.y + rect.height;
	},

	/*
		Method:
			len
		
		Get the length of the vector. If the length is less than |0.005| it counts as 0.
		
		Returns:
			The length of the vector
	*/

	len: function() {
		var l = Math.sqrt(this.x * this.x + this.y * this.y);
		if ( l < 0.005 && l > -0.005) return 0;
		return l;
	},
	
	/*
		Method:
			is
		
		Check if the vector is the same as another. Tests for equality on 
		the x and y-properties.
		
		Returns:
			true if equal, otherwise false
	*/

	is: function(test) {
		return typeof test == 'object' && this.x == test.x && this.y == test.y;
	},
	
	/*
		Method:
			dot
		
		Get the dot-product of two vectors.
		
		Parameters:
			v2 - Vector-like object
		
		Returns:
			The dot-product of the two.
	*/
	
	dot: function(v2) {
		return this.x * v2.x + this.y * v2.y;
	},

	/*
		Method:
			inTriangle
		
		Check to see if the vector is inside a vector consisting of the points a, b and c.
		Algorithm is from: [TODO: link]
		
		Parameters:
			a, b, c - Vector-like objects that make up the triangle
		
		Returns:
			true if in triangle, false otherwise
	*/
	
	inTriangle: function(a, b, c) {
		// Compute vectors        
		var v0 = c.subNew(a);
		var v1 = b.subNew(a);
		var v2 = p.subNew(a);
		
		// Compute dot products
		var dot00 = v0.dot(v0);
		var dot01 = v0.dot(v1);
		var dot02 = v0.dot(v2);
		var dot11 = v1.dot(v1);
		var dot12 = v1.dot(v2);
		
		// Compute barycentric coordinates
		var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
		var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
		var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
		
		// Check if point is in triangle
		return (u > 0) && (v > 0) && (u + v < 1);
	},

	toString: function() {
		return '[Vector(' + this.x + ', ' + this.y + ') angle: ' + this.angle() + ', length: ' + this.len() + ']';
	}
});

if ( exports ) exports.Vector = Vector;