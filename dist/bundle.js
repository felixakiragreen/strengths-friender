
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		var name = v.func ? v.func.name : v.name;
		return '<function' + (name === '' ? '' : ':') + name + '>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;
	
	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}	
	
	return _elm_lang$core$Native_List.fromArray(is);
}

function toInt(s)
{
	var len = s.length;
	if (len === 0)
	{
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
	}
	var start = 0;
	if (s[0] === '-')
	{
		if (len === 1)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
		}
		start = 1;
	}
	for (var i = start; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int" );
		}
	}
	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function toFloat(s)
{
	var len = s.length;
	if (len === 0)
	{
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
	}
	var start = 0;
	if (s[0] === '-')
	{
		if (len === 1)
		{
			return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
		}
		start = 1;
	}
	var dotCount = 0;
	for (var i = start; i < len; ++i)
	{
		var c = s[i];
		if ('0' <= c && c <= '9')
		{
			continue;
		}
		if (c === '.')
		{
			dotCount += 1;
			if (dotCount <= 1)
			{
				continue;
			}
		}
		return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float" );
	}
	return _elm_lang$core$Result$Ok(parseFloat(s));
}

function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		var value = result._0;
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		currentSend(incomingValue);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _MichaelCombs28$elm_dom$DOM$className = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'className',
		_1: {ctor: '[]'}
	},
	_elm_lang$core$Json_Decode$string);
var _MichaelCombs28$elm_dom$DOM$scrollTop = A2(_elm_lang$core$Json_Decode$field, 'scrollTop', _elm_lang$core$Json_Decode$float);
var _MichaelCombs28$elm_dom$DOM$scrollLeft = A2(_elm_lang$core$Json_Decode$field, 'scrollLeft', _elm_lang$core$Json_Decode$float);
var _MichaelCombs28$elm_dom$DOM$offsetTop = A2(_elm_lang$core$Json_Decode$field, 'offsetTop', _elm_lang$core$Json_Decode$float);
var _MichaelCombs28$elm_dom$DOM$offsetLeft = A2(_elm_lang$core$Json_Decode$field, 'offsetLeft', _elm_lang$core$Json_Decode$float);
var _MichaelCombs28$elm_dom$DOM$offsetHeight = A2(_elm_lang$core$Json_Decode$field, 'offsetHeight', _elm_lang$core$Json_Decode$float);
var _MichaelCombs28$elm_dom$DOM$offsetWidth = A2(_elm_lang$core$Json_Decode$field, 'offsetWidth', _elm_lang$core$Json_Decode$float);
var _MichaelCombs28$elm_dom$DOM$childNodes = function (decoder) {
	var loop = F2(
		function (idx, xs) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (_p0) {
					return A2(
						_elm_lang$core$Maybe$withDefault,
						_elm_lang$core$Json_Decode$succeed(xs),
						A2(
							_elm_lang$core$Maybe$map,
							function (x) {
								return A2(
									loop,
									idx + 1,
									{ctor: '::', _0: x, _1: xs});
							},
							_p0));
				},
				_elm_lang$core$Json_Decode$maybe(
					A2(
						_elm_lang$core$Json_Decode$field,
						_elm_lang$core$Basics$toString(idx),
						decoder)));
		});
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$List$reverse,
		A2(
			_elm_lang$core$Json_Decode$field,
			'childNodes',
			A2(
				loop,
				0,
				{ctor: '[]'})));
};
var _MichaelCombs28$elm_dom$DOM$childNode = function (idx) {
	return _elm_lang$core$Json_Decode$at(
		{
			ctor: '::',
			_0: 'childNodes',
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Basics$toString(idx),
				_1: {ctor: '[]'}
			}
		});
};
var _MichaelCombs28$elm_dom$DOM$parentElement = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'parentElement', decoder);
};
var _MichaelCombs28$elm_dom$DOM$previousSibling = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'previousSibling', decoder);
};
var _MichaelCombs28$elm_dom$DOM$nextSibling = _elm_lang$core$Json_Decode$field('nextSibling');
var _MichaelCombs28$elm_dom$DOM$offsetParent = F2(
	function (x, decoder) {
		return _elm_lang$core$Json_Decode$oneOf(
			{
				ctor: '::',
				_0: A2(
					_elm_lang$core$Json_Decode$field,
					'offsetParent',
					_elm_lang$core$Json_Decode$null(x)),
				_1: {
					ctor: '::',
					_0: A2(_elm_lang$core$Json_Decode$field, 'offsetParent', decoder),
					_1: {ctor: '[]'}
				}
			});
	});
var _MichaelCombs28$elm_dom$DOM$position = F2(
	function (x, y) {
		return A2(
			_elm_lang$core$Json_Decode$andThen,
			function (_p1) {
				var _p2 = _p1;
				var _p4 = _p2._1;
				var _p3 = _p2._0;
				return A2(
					_MichaelCombs28$elm_dom$DOM$offsetParent,
					{ctor: '_Tuple2', _0: _p3, _1: _p4},
					A2(_MichaelCombs28$elm_dom$DOM$position, _p3, _p4));
			},
			A5(
				_elm_lang$core$Json_Decode$map4,
				F4(
					function (scrollLeft, scrollTop, offsetLeft, offsetTop) {
						return {ctor: '_Tuple2', _0: (x + offsetLeft) - scrollLeft, _1: (y + offsetTop) - scrollTop};
					}),
				_MichaelCombs28$elm_dom$DOM$scrollLeft,
				_MichaelCombs28$elm_dom$DOM$scrollTop,
				_MichaelCombs28$elm_dom$DOM$offsetLeft,
				_MichaelCombs28$elm_dom$DOM$offsetTop));
	});
var _MichaelCombs28$elm_dom$DOM$boundingClientRect = A4(
	_elm_lang$core$Json_Decode$map3,
	F3(
		function (_p5, width, height) {
			var _p6 = _p5;
			return {top: _p6._1, left: _p6._0, width: width, height: height};
		}),
	A2(_MichaelCombs28$elm_dom$DOM$position, 0, 0),
	_MichaelCombs28$elm_dom$DOM$offsetWidth,
	_MichaelCombs28$elm_dom$DOM$offsetHeight);
var _MichaelCombs28$elm_dom$DOM$target = function (decoder) {
	return A2(_elm_lang$core$Json_Decode$field, 'target', decoder);
};
var _MichaelCombs28$elm_dom$DOM$Rectangle = F4(
	function (a, b, c, d) {
		return {top: a, left: b, width: c, height: d};
	});

var _MichaelCombs28$elm_parts$Parts$map2nd = F2(
	function (f, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: f(_p1._1)
		};
	});
var _MichaelCombs28$elm_parts$Parts$map1st = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: f(_p3._0),
			_1: _p3._1
		};
	});
var _MichaelCombs28$elm_parts$Parts$generalize = F4(
	function (upd, f, m, c) {
		return A2(
			_MichaelCombs28$elm_parts$Parts$map2nd,
			_elm_lang$core$Platform_Cmd$map(f),
			A2(
				_MichaelCombs28$elm_parts$Parts$map1st,
				_elm_lang$core$Maybe$Just,
				A2(upd, m, c)));
	});
var _MichaelCombs28$elm_parts$Parts$update_ = F2(
	function (_p4, c) {
		var _p5 = _p4;
		return _p5._0(c);
	});
var _MichaelCombs28$elm_parts$Parts$update = F2(
	function (_p6, c) {
		var _p7 = _p6;
		return A2(
			_MichaelCombs28$elm_parts$Parts$map1st,
			_elm_lang$core$Maybe$withDefault(c),
			_p7._0(c));
	});
var _MichaelCombs28$elm_parts$Parts$indexed = F3(
	function (get, set, model0) {
		return {
			ctor: '_Tuple2',
			_0: F2(
				function (idx, c) {
					return A2(
						_elm_lang$core$Maybe$withDefault,
						model0,
						A2(
							_elm_lang$core$Dict$get,
							idx,
							get(c)));
				}),
			_1: F3(
				function (idx, model, c) {
					return A2(
						set,
						A3(
							_elm_lang$core$Dict$insert,
							idx,
							model,
							get(c)),
						c);
				})
		};
	});
var _MichaelCombs28$elm_parts$Parts$accessors = F4(
	function (get0, set0, model0, idx) {
		var _p8 = A3(_MichaelCombs28$elm_parts$Parts$indexed, get0, set0, model0);
		var get = _p8._0;
		var set = _p8._1;
		return {
			get: get(idx),
			set: set(idx),
			map: F2(
				function (f, c) {
					return A3(
						_elm_lang$core$Basics$flip,
						set(idx),
						c,
						f(
							A2(get, idx, c)));
				}),
			reset: function (c) {
				return function (m) {
					return A2(set0, m, c);
				}(
					A2(
						_elm_lang$core$Dict$remove,
						idx,
						get0(c)));
			}
		};
	});
var _MichaelCombs28$elm_parts$Parts$embedUpdate = F6(
	function (get, set, update, f, msg, c) {
		return A2(
			_MichaelCombs28$elm_parts$Parts$map1st,
			_elm_lang$core$Maybe$map(
				A2(_elm_lang$core$Basics$flip, set, c)),
			A3(
				update,
				f,
				msg,
				get(c)));
	});
var _MichaelCombs28$elm_parts$Parts$embedView = F2(
	function (get, view) {
		return function (_p9) {
			return view(
				get(_p9));
		};
	});
var _MichaelCombs28$elm_parts$Parts$Accessors = F4(
	function (a, b, c, d) {
		return {get: a, set: b, map: c, reset: d};
	});
var _MichaelCombs28$elm_parts$Parts$Msg = function (a) {
	return {ctor: 'Msg', _0: a};
};
var _MichaelCombs28$elm_parts$Parts$partial = F3(
	function (fwd, upd, msg) {
		return _MichaelCombs28$elm_parts$Parts$Msg(
			function (c) {
				return A3(
					upd,
					function (_p10) {
						return fwd(
							A3(_MichaelCombs28$elm_parts$Parts$partial, fwd, upd, _p10));
					},
					msg,
					c);
			});
	});
var _MichaelCombs28$elm_parts$Parts$pack = F5(
	function (update, get0, set0, model0, fwd) {
		var _p11 = A3(_MichaelCombs28$elm_parts$Parts$indexed, get0, set0, model0);
		var get = _p11._0;
		var set = _p11._1;
		return function (idx) {
			return function (_p12) {
				return fwd(
					A3(
						_MichaelCombs28$elm_parts$Parts$partial,
						fwd,
						A3(
							_MichaelCombs28$elm_parts$Parts$embedUpdate,
							get(idx),
							set(idx),
							update),
						_p12));
			};
		};
	});
var _MichaelCombs28$elm_parts$Parts$create = F6(
	function (view, update, get0, set0, model0, fwd) {
		var embeddedUpdate = A5(_MichaelCombs28$elm_parts$Parts$pack, update, get0, set0, model0, fwd);
		var get = _elm_lang$core$Tuple$first(
			A3(_MichaelCombs28$elm_parts$Parts$indexed, get0, set0, model0));
		return F2(
			function (idx, c) {
				return A2(
					view,
					embeddedUpdate(idx),
					A2(get, idx, c));
			});
	});
var _MichaelCombs28$elm_parts$Parts$pack1 = F4(
	function (update, get, set, fwd) {
		return function (_p13) {
			return fwd(
				A3(
					_MichaelCombs28$elm_parts$Parts$partial,
					fwd,
					A3(_MichaelCombs28$elm_parts$Parts$embedUpdate, get, set, update),
					_p13));
		};
	});
var _MichaelCombs28$elm_parts$Parts$create1 = F5(
	function (view, update, get, set, fwd) {
		var embeddedUpdate = function (_p14) {
			return fwd(
				A3(
					_MichaelCombs28$elm_parts$Parts$partial,
					fwd,
					A3(_MichaelCombs28$elm_parts$Parts$embedUpdate, get, set, update),
					_p14));
		};
		return A2(
			_MichaelCombs28$elm_parts$Parts$embedView,
			get,
			view(embeddedUpdate));
	});

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (!a.options === b.options)
	{
		if (a.stopPropagation !== b.stopPropagation || a.preventDefault !== b.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { callback(); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$core$Process$kill = _elm_lang$core$Native_Scheduler.kill;
var _elm_lang$core$Process$sleep = _elm_lang$core$Native_Scheduler.sleep;
var _elm_lang$core$Process$spawn = _elm_lang$core$Native_Scheduler.spawn;

var _MichaelCombs28$elm_mdl$Material_Helpers$partsUpdatePort = function (component) {
	var _p0 = component;
	if (_p0.ctor === 'Just') {
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Maybe$Just(_p0._0._0),
			_1: _p0._0._1
		};
	} else {
		return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Platform_Cmd$none};
	}
};
var _MichaelCombs28$elm_mdl$Material_Helpers$noAttr = A2(_elm_lang$html$Html_Attributes$attribute, 'data-elm-mdl-noop', '');
var _MichaelCombs28$elm_mdl$Material_Helpers$aria = F2(
	function (name, value) {
		return value ? A2(
			_elm_lang$html$Html_Attributes$attribute,
			A2(_elm_lang$core$Basics_ops['++'], 'aria-', name),
			'true') : _MichaelCombs28$elm_mdl$Material_Helpers$noAttr;
	});
var _MichaelCombs28$elm_mdl$Material_Helpers$delay = F2(
	function (t, x) {
		return A2(
			_elm_lang$core$Task$perform,
			_elm_lang$core$Basics$always(x),
			_elm_lang$core$Process$sleep(t));
	});
var _MichaelCombs28$elm_mdl$Material_Helpers$cssTransitionStep = function (x) {
	return A2(_MichaelCombs28$elm_mdl$Material_Helpers$delay, 50, x);
};
var _MichaelCombs28$elm_mdl$Material_Helpers$cmd = function (msg) {
	return A2(
		_elm_lang$core$Task$perform,
		_elm_lang$core$Basics$always(msg),
		_elm_lang$core$Task$succeed(msg));
};
var _MichaelCombs28$elm_mdl$Material_Helpers$lift = F6(
	function (get, set, fwd, update, action, model) {
		var _p1 = A2(
			update,
			action,
			get(model));
		var submodel_ = _p1._0;
		var e = _p1._1;
		return {
			ctor: '_Tuple2',
			_0: A2(set, model, submodel_),
			_1: A2(_elm_lang$core$Platform_Cmd$map, fwd, e)
		};
	});
var _MichaelCombs28$elm_mdl$Material_Helpers$lift_ = F5(
	function (get, set, update, action, model) {
		return {
			ctor: '_Tuple2',
			_0: A2(
				set,
				model,
				A2(
					update,
					action,
					get(model))),
			_1: _elm_lang$core$Platform_Cmd$none
		};
	});
var _MichaelCombs28$elm_mdl$Material_Helpers$map2nd = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: _p3._0,
			_1: f(_p3._1)
		};
	});
var _MichaelCombs28$elm_mdl$Material_Helpers$map1st = F2(
	function (f, _p4) {
		var _p5 = _p4;
		return {
			ctor: '_Tuple2',
			_0: f(_p5._0),
			_1: _p5._1
		};
	});
var _MichaelCombs28$elm_mdl$Material_Helpers$blurOn = function (evt) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		A2(_elm_lang$core$Basics_ops['++'], 'on', evt),
		'this.blur()');
};
var _MichaelCombs28$elm_mdl$Material_Helpers$effect = F2(
	function (e, x) {
		return {ctor: '_Tuple2', _0: x, _1: e};
	});
var _MichaelCombs28$elm_mdl$Material_Helpers$pure = _MichaelCombs28$elm_mdl$Material_Helpers$effect(_elm_lang$core$Platform_Cmd$none);
var _MichaelCombs28$elm_mdl$Material_Helpers$filter = F3(
	function (elem, attr, html) {
		return A2(
			elem,
			attr,
			A2(
				_elm_lang$core$List$filterMap,
				function (x) {
					return x;
				},
				html));
	});

var _elm_lang$html$Html_Events$keyCode = A2(_elm_lang$core$Json_Decode$field, 'keyCode', _elm_lang$core$Json_Decode$int);
var _elm_lang$html$Html_Events$targetChecked = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'checked',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$bool);
var _elm_lang$html$Html_Events$targetValue = A2(
	_elm_lang$core$Json_Decode$at,
	{
		ctor: '::',
		_0: 'target',
		_1: {
			ctor: '::',
			_0: 'value',
			_1: {ctor: '[]'}
		}
	},
	_elm_lang$core$Json_Decode$string);
var _elm_lang$html$Html_Events$defaultOptions = _elm_lang$virtual_dom$VirtualDom$defaultOptions;
var _elm_lang$html$Html_Events$onWithOptions = _elm_lang$virtual_dom$VirtualDom$onWithOptions;
var _elm_lang$html$Html_Events$on = _elm_lang$virtual_dom$VirtualDom$on;
var _elm_lang$html$Html_Events$onFocus = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'focus',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onBlur = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'blur',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onSubmitOptions = _elm_lang$core$Native_Utils.update(
	_elm_lang$html$Html_Events$defaultOptions,
	{preventDefault: true});
var _elm_lang$html$Html_Events$onSubmit = function (msg) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'submit',
		_elm_lang$html$Html_Events$onSubmitOptions,
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onCheck = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'change',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetChecked));
};
var _elm_lang$html$Html_Events$onInput = function (tagger) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, tagger, _elm_lang$html$Html_Events$targetValue));
};
var _elm_lang$html$Html_Events$onMouseOut = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseout',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseOver = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseover',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseLeave = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseEnter = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseUp = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseup',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onMouseDown = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mousedown',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onDoubleClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'dblclick',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$onClick = function (msg) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$html$Html_Events$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});

var _MichaelCombs28$elm_mdl$Material_Options_Internal$None = {ctor: 'None'};
var _MichaelCombs28$elm_mdl$Material_Options_Internal$Set = function (a) {
	return {ctor: 'Set', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Options_Internal$Many = function (a) {
	return {ctor: 'Many', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Options_Internal$Internal = function (a) {
	return {ctor: 'Internal', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute = _MichaelCombs28$elm_mdl$Material_Options_Internal$Internal;
var _MichaelCombs28$elm_mdl$Material_Options_Internal$Attribute = function (a) {
	return {ctor: 'Attribute', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Options_Internal$CSS = function (a) {
	return {ctor: 'CSS', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Options_Internal$Class = function (a) {
	return {ctor: 'Class', _0: a};
};

var _MichaelCombs28$elm_mdl$Material_Options$id = function (_p0) {
	return _MichaelCombs28$elm_mdl$Material_Options_Internal$Attribute(
		_elm_lang$html$Html_Attributes$id(_p0));
};
var _MichaelCombs28$elm_mdl$Material_Options$attr = _MichaelCombs28$elm_mdl$Material_Options_Internal$Attribute;
var _MichaelCombs28$elm_mdl$Material_Options$attribute = _MichaelCombs28$elm_mdl$Material_Options_Internal$Attribute;
var _MichaelCombs28$elm_mdl$Material_Options$stylesheet = function (css) {
	return A3(
		_elm_lang$html$Html$node,
		'style',
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(css),
			_1: {ctor: '[]'}
		});
};
var _MichaelCombs28$elm_mdl$Material_Options$data = F2(
	function (key, val) {
		return _MichaelCombs28$elm_mdl$Material_Options_Internal$Attribute(
			A2(
				_elm_lang$html$Html_Attributes$attribute,
				A2(_elm_lang$core$Basics_ops['++'], 'data-', key),
				val));
	});
var _MichaelCombs28$elm_mdl$Material_Options$set = _MichaelCombs28$elm_mdl$Material_Options_Internal$Set;
var _MichaelCombs28$elm_mdl$Material_Options$inner = function (options) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (c) {
			return _elm_lang$core$Native_Utils.update(
				c,
				{
					inner: A2(_elm_lang$core$Basics_ops['++'], options, c.inner)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Options$nop = _MichaelCombs28$elm_mdl$Material_Options_Internal$None;
var _MichaelCombs28$elm_mdl$Material_Options$when = F2(
	function (prop, guard) {
		return guard ? prop : _MichaelCombs28$elm_mdl$Material_Options$nop;
	});
var _MichaelCombs28$elm_mdl$Material_Options$maybe = function (prop) {
	return A2(_elm_lang$core$Maybe$withDefault, _MichaelCombs28$elm_mdl$Material_Options$nop, prop);
};
var _MichaelCombs28$elm_mdl$Material_Options$many = _MichaelCombs28$elm_mdl$Material_Options_Internal$Many;
var _MichaelCombs28$elm_mdl$Material_Options$css = F2(
	function (key, value) {
		return _MichaelCombs28$elm_mdl$Material_Options_Internal$CSS(
			{ctor: '_Tuple2', _0: key, _1: value});
	});
var _MichaelCombs28$elm_mdl$Material_Options$center = _MichaelCombs28$elm_mdl$Material_Options$many(
	{
		ctor: '::',
		_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'display', 'flex'),
		_1: {
			ctor: '::',
			_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'align-items', 'center'),
			_1: {
				ctor: '::',
				_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'justify-content', 'center'),
				_1: {ctor: '[]'}
			}
		}
	});
var _MichaelCombs28$elm_mdl$Material_Options$scrim = function (opacity) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_Options$css,
		'background',
		A2(
			_elm_lang$core$Basics_ops['++'],
			'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, ',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(opacity),
				'))')));
};
var _MichaelCombs28$elm_mdl$Material_Options$cs = function (c) {
	return _MichaelCombs28$elm_mdl$Material_Options_Internal$Class(c);
};
var _MichaelCombs28$elm_mdl$Material_Options$disabled = function (v) {
	return _MichaelCombs28$elm_mdl$Material_Options_Internal$Attribute(
		_elm_lang$html$Html_Attributes$disabled(v));
};
var _MichaelCombs28$elm_mdl$Material_Options$addAttributes = F2(
	function (summary, attrs) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			summary.attrs,
			A2(
				_elm_lang$core$Basics_ops['++'],
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$style(summary.css),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class(
							A2(_elm_lang$core$String$join, ' ', summary.classes)),
						_1: {ctor: '[]'}
					}
				},
				attrs));
	});
var _MichaelCombs28$elm_mdl$Material_Options$collect1_ = F2(
	function (options, acc) {
		var _p1 = options;
		switch (_p1.ctor) {
			case 'Class':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						classes: {ctor: '::', _0: _p1._0, _1: acc.classes}
					});
			case 'CSS':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						css: {ctor: '::', _0: _p1._0, _1: acc.css}
					});
			case 'Attribute':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						attrs: {ctor: '::', _0: _p1._0, _1: acc.attrs}
					});
			case 'Internal':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						attrs: A2(
							_elm_lang$core$Basics_ops['++'],
							acc.attrs,
							{
								ctor: '::',
								_0: _p1._0,
								_1: {ctor: '[]'}
							})
					});
			case 'Many':
				return A3(_elm_lang$core$List$foldl, _MichaelCombs28$elm_mdl$Material_Options$collect1_, acc, _p1._0);
			case 'Set':
				return acc;
			default:
				return acc;
		}
	});
var _MichaelCombs28$elm_mdl$Material_Options$collect1 = F2(
	function (option, acc) {
		var _p2 = option;
		switch (_p2.ctor) {
			case 'Class':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						classes: {ctor: '::', _0: _p2._0, _1: acc.classes}
					});
			case 'CSS':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						css: {ctor: '::', _0: _p2._0, _1: acc.css}
					});
			case 'Internal':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						attrs: A2(
							_elm_lang$core$Basics_ops['++'],
							acc.attrs,
							{
								ctor: '::',
								_0: _p2._0,
								_1: {ctor: '[]'}
							})
					});
			case 'Attribute':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						attrs: {ctor: '::', _0: _p2._0, _1: acc.attrs}
					});
			case 'Many':
				return A3(_elm_lang$core$List$foldl, _MichaelCombs28$elm_mdl$Material_Options$collect1, acc, _p2._0);
			case 'Set':
				return _elm_lang$core$Native_Utils.update(
					acc,
					{
						config: _p2._0(acc.config)
					});
			default:
				return acc;
		}
	});
var _MichaelCombs28$elm_mdl$Material_Options$recollect = _elm_lang$core$List$foldl(_MichaelCombs28$elm_mdl$Material_Options$collect1);
var _MichaelCombs28$elm_mdl$Material_Options$apply = F4(
	function (summary, ctor, options, attrs) {
		return ctor(
			A2(
				_MichaelCombs28$elm_mdl$Material_Options$addAttributes,
				A2(_MichaelCombs28$elm_mdl$Material_Options$recollect, summary, options),
				attrs));
	});
var _MichaelCombs28$elm_mdl$Material_Options$Summary = F4(
	function (a, b, c, d) {
		return {classes: a, css: b, attrs: c, config: d};
	});
var _MichaelCombs28$elm_mdl$Material_Options$collect = function (_p3) {
	return _MichaelCombs28$elm_mdl$Material_Options$recollect(
		A4(
			_MichaelCombs28$elm_mdl$Material_Options$Summary,
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'},
			_p3));
};
var _MichaelCombs28$elm_mdl$Material_Options$collect_ = A2(
	_elm_lang$core$List$foldl,
	_MichaelCombs28$elm_mdl$Material_Options$collect1_,
	A4(
		_MichaelCombs28$elm_mdl$Material_Options$Summary,
		{ctor: '[]'},
		{ctor: '[]'},
		{ctor: '[]'},
		{ctor: '_Tuple0'}));
var _MichaelCombs28$elm_mdl$Material_Options$styled = F2(
	function (ctor, props) {
		return ctor(
			A2(
				_MichaelCombs28$elm_mdl$Material_Options$addAttributes,
				_MichaelCombs28$elm_mdl$Material_Options$collect_(props),
				{ctor: '[]'}));
	});
var _MichaelCombs28$elm_mdl$Material_Options$div = _MichaelCombs28$elm_mdl$Material_Options$styled(_elm_lang$html$Html$div);
var _MichaelCombs28$elm_mdl$Material_Options$span = _MichaelCombs28$elm_mdl$Material_Options$styled(_elm_lang$html$Html$span);
var _MichaelCombs28$elm_mdl$Material_Options$styled_ = F3(
	function (ctor, props, attrs) {
		return ctor(
			A2(
				_MichaelCombs28$elm_mdl$Material_Options$addAttributes,
				_MichaelCombs28$elm_mdl$Material_Options$collect_(props),
				attrs));
	});
var _MichaelCombs28$elm_mdl$Material_Options$img = F2(
	function (options, attrs) {
		return A4(
			_MichaelCombs28$elm_mdl$Material_Options$styled_,
			_elm_lang$html$Html$img,
			options,
			attrs,
			{ctor: '[]'});
	});

var _MichaelCombs28$elm_mdl$Material_Ripple$styles = F2(
	function (m, frame) {
		var r = m.rect;
		var toPx = function (k) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(
					_elm_lang$core$Basics$round(k)),
				'px');
		};
		var offset = A2(
			_elm_lang$core$Basics_ops['++'],
			'translate(',
			A2(
				_elm_lang$core$Basics_ops['++'],
				toPx(m.x),
				A2(
					_elm_lang$core$Basics_ops['++'],
					', ',
					A2(
						_elm_lang$core$Basics_ops['++'],
						toPx(m.y),
						')'))));
		var rippleSize = toPx(
			(_elm_lang$core$Basics$sqrt((r.width * r.width) + (r.height * r.height)) * 2.0) + 2.0);
		var scale = _elm_lang$core$Native_Utils.eq(frame, 0) ? 'scale(0.0001, 0.0001)' : '';
		var transformString = A2(
			_elm_lang$core$Basics_ops['++'],
			'translate(-50%, -50%) ',
			A2(_elm_lang$core$Basics_ops['++'], offset, scale));
		return {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: 'width', _1: rippleSize},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'height', _1: rippleSize},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: '-webkit-transform', _1: transformString},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: '-ms-transform', _1: transformString},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'transform', _1: transformString},
							_1: {ctor: '[]'}
						}
					}
				}
			}
		};
	});
var _MichaelCombs28$elm_mdl$Material_Ripple$Metrics = F3(
	function (a, b, c) {
		return {rect: a, x: b, y: c};
	});
var _MichaelCombs28$elm_mdl$Material_Ripple$computeMetrics = function (g) {
	var rect = g.rect;
	var set = F2(
		function (x, y) {
			return _elm_lang$core$Maybe$Just(
				{ctor: '_Tuple2', _0: x - rect.left, _1: y - rect.top});
		});
	return A2(
		_elm_lang$core$Maybe$map,
		function (_p0) {
			var _p1 = _p0;
			return A3(_MichaelCombs28$elm_mdl$Material_Ripple$Metrics, rect, _p1._0, _p1._1);
		},
		function () {
			var _p2 = {ctor: '_Tuple4', _0: g.clientX, _1: g.clientY, _2: g.touchX, _3: g.touchY};
			_v1_3:
			do {
				if (_p2.ctor === '_Tuple4') {
					if ((_p2._0.ctor === 'Just') && (_p2._1.ctor === 'Just')) {
						if ((_p2._0._0 === 0.0) && (_p2._1._0 === 0.0)) {
							return _elm_lang$core$Maybe$Just(
								{ctor: '_Tuple2', _0: rect.width / 2.0, _1: rect.height / 2.0});
						} else {
							return A2(set, _p2._0._0, _p2._1._0);
						}
					} else {
						if ((_p2._2.ctor === 'Just') && (_p2._3.ctor === 'Just')) {
							return A2(set, _p2._2._0, _p2._3._0);
						} else {
							break _v1_3;
						}
					}
				} else {
					break _v1_3;
				}
			} while(false);
			return _elm_lang$core$Maybe$Nothing;
		}());
};
var _MichaelCombs28$elm_mdl$Material_Ripple$Model = F3(
	function (a, b, c) {
		return {animation: a, metrics: b, ignoringMouseDown: c};
	});
var _MichaelCombs28$elm_mdl$Material_Ripple$DOMState = F6(
	function (a, b, c, d, e, f) {
		return {rect: a, clientX: b, clientY: c, touchX: d, touchY: e, type_: f};
	});
var _MichaelCombs28$elm_mdl$Material_Ripple$geometryDecoder = A7(
	_elm_lang$core$Json_Decode$map6,
	_MichaelCombs28$elm_mdl$Material_Ripple$DOMState,
	A2(_elm_lang$core$Json_Decode$field, 'currentTarget', _MichaelCombs28$elm_dom$DOM$boundingClientRect),
	_elm_lang$core$Json_Decode$maybe(
		A2(_elm_lang$core$Json_Decode$field, 'clientX', _elm_lang$core$Json_Decode$float)),
	_elm_lang$core$Json_Decode$maybe(
		A2(_elm_lang$core$Json_Decode$field, 'clientY', _elm_lang$core$Json_Decode$float)),
	_elm_lang$core$Json_Decode$maybe(
		A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'touches',
				_1: {
					ctor: '::',
					_0: '0',
					_1: {
						ctor: '::',
						_0: 'clientX',
						_1: {ctor: '[]'}
					}
				}
			},
			_elm_lang$core$Json_Decode$float)),
	_elm_lang$core$Json_Decode$maybe(
		A2(
			_elm_lang$core$Json_Decode$at,
			{
				ctor: '::',
				_0: 'touches',
				_1: {
					ctor: '::',
					_0: '0',
					_1: {
						ctor: '::',
						_0: 'clientY',
						_1: {ctor: '[]'}
					}
				}
			},
			_elm_lang$core$Json_Decode$float)),
	A2(_elm_lang$core$Json_Decode$field, 'type', _elm_lang$core$Json_Decode$string));
var _MichaelCombs28$elm_mdl$Material_Ripple$Inert = {ctor: 'Inert'};
var _MichaelCombs28$elm_mdl$Material_Ripple$model = {animation: _MichaelCombs28$elm_mdl$Material_Ripple$Inert, metrics: _elm_lang$core$Maybe$Nothing, ignoringMouseDown: false};
var _MichaelCombs28$elm_mdl$Material_Ripple$Frame = function (a) {
	return {ctor: 'Frame', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Ripple$view_ = F2(
	function (attrs, model) {
		var styling = function () {
			var _p3 = {ctor: '_Tuple2', _0: model.metrics, _1: model.animation};
			if ((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) {
				if (_p3._1.ctor === 'Frame') {
					return A2(_MichaelCombs28$elm_mdl$Material_Ripple$styles, _p3._0._0, _p3._1._0);
				} else {
					return A2(_MichaelCombs28$elm_mdl$Material_Ripple$styles, _p3._0._0, 1);
				}
			} else {
				return {ctor: '[]'};
			}
		}();
		return A2(
			_elm_lang$html$Html$span,
			attrs,
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$span,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$classList(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'mdl-ripple', _1: true},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'is-animating',
										_1: !_elm_lang$core$Native_Utils.eq(
											model.animation,
											_MichaelCombs28$elm_mdl$Material_Ripple$Frame(0))
									},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'is-visible',
											_1: !_elm_lang$core$Native_Utils.eq(model.animation, _MichaelCombs28$elm_mdl$Material_Ripple$Inert)
										},
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(styling),
							_1: {ctor: '[]'}
						}
					},
					{ctor: '[]'}),
				_1: {ctor: '[]'}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Ripple$Tick = {ctor: 'Tick'};
var _MichaelCombs28$elm_mdl$Material_Ripple$update = F2(
	function (action, model) {
		var _p4 = action;
		switch (_p4.ctor) {
			case 'Down':
				var _p5 = _p4._0;
				return (_elm_lang$core$Native_Utils.eq(_p5.type_, 'mousedown') && model.ignoringMouseDown) ? _MichaelCombs28$elm_mdl$Material_Helpers$pure(
					_elm_lang$core$Native_Utils.update(
						model,
						{ignoringMouseDown: false})) : A2(
					_MichaelCombs28$elm_mdl$Material_Helpers$effect,
					_MichaelCombs28$elm_mdl$Material_Helpers$cssTransitionStep(_MichaelCombs28$elm_mdl$Material_Ripple$Tick),
					_elm_lang$core$Native_Utils.update(
						model,
						{
							animation: _MichaelCombs28$elm_mdl$Material_Ripple$Frame(0),
							metrics: _MichaelCombs28$elm_mdl$Material_Ripple$computeMetrics(_p5),
							ignoringMouseDown: _elm_lang$core$Native_Utils.eq(_p5.type_, 'touchstart') ? true : model.ignoringMouseDown
						}));
			case 'Up':
				return _MichaelCombs28$elm_mdl$Material_Helpers$pure(
					_elm_lang$core$Native_Utils.update(
						model,
						{animation: _MichaelCombs28$elm_mdl$Material_Ripple$Inert}));
			default:
				return _elm_lang$core$Native_Utils.eq(
					model.animation,
					_MichaelCombs28$elm_mdl$Material_Ripple$Frame(0)) ? _MichaelCombs28$elm_mdl$Material_Helpers$pure(
					_elm_lang$core$Native_Utils.update(
						model,
						{
							animation: _MichaelCombs28$elm_mdl$Material_Ripple$Frame(1)
						})) : _MichaelCombs28$elm_mdl$Material_Helpers$pure(model);
		}
	});
var _MichaelCombs28$elm_mdl$Material_Ripple$Up = {ctor: 'Up'};
var _MichaelCombs28$elm_mdl$Material_Ripple$upOn_ = F2(
	function (f, name) {
		return A2(
			_elm_lang$html$Html_Events$on,
			name,
			_elm_lang$core$Json_Decode$succeed(
				f(_MichaelCombs28$elm_mdl$Material_Ripple$Up)));
	});
var _MichaelCombs28$elm_mdl$Material_Ripple$upOn = _MichaelCombs28$elm_mdl$Material_Ripple$upOn_(_elm_lang$core$Basics$identity);
var _MichaelCombs28$elm_mdl$Material_Ripple$Down = function (a) {
	return {ctor: 'Down', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Ripple$downOn_ = F2(
	function (f, name) {
		return A2(
			_elm_lang$html$Html_Events$on,
			name,
			A2(
				_elm_lang$core$Json_Decode$map,
				function (_p6) {
					return f(
						_MichaelCombs28$elm_mdl$Material_Ripple$Down(_p6));
				},
				_MichaelCombs28$elm_mdl$Material_Ripple$geometryDecoder));
	});
var _MichaelCombs28$elm_mdl$Material_Ripple$downOn = _MichaelCombs28$elm_mdl$Material_Ripple$downOn_(_elm_lang$core$Basics$identity);
var _MichaelCombs28$elm_mdl$Material_Ripple$view = function (_p7) {
	return _MichaelCombs28$elm_mdl$Material_Ripple$view_(
		A3(
			_elm_lang$core$Basics$flip,
			_elm_lang$core$List$append,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Ripple$upOn('mouseup'),
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Ripple$upOn('mouseleave'),
					_1: {
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Ripple$upOn('touchend'),
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Ripple$upOn('blur'),
							_1: {
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Ripple$downOn('mousedown'),
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Ripple$downOn('touchstart'),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			},
			_p7));
};

var _MichaelCombs28$elm_mdl$Material_Button$icon = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--icon');
var _MichaelCombs28$elm_mdl$Material_Button$minifab = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--mini-fab');
var _MichaelCombs28$elm_mdl$Material_Button$fab = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--fab');
var _MichaelCombs28$elm_mdl$Material_Button$raised = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--raised');
var _MichaelCombs28$elm_mdl$Material_Button$flat = _MichaelCombs28$elm_mdl$Material_Options$nop;
var _MichaelCombs28$elm_mdl$Material_Button$blurAndForward = function (event) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		A2(_elm_lang$core$Basics_ops['++'], 'on', event),
		'this.blur(); (function(self) { var e = document.createEvent(\'Event\'); e.initEvent(\'touchcancel\', true, true); self.lastChild.dispatchEvent(e); }(this));');
};
var _MichaelCombs28$elm_mdl$Material_Button$type_ = function (tp) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					type_: _elm_lang$core$Maybe$Just(tp)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Button$accent = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--accent');
var _MichaelCombs28$elm_mdl$Material_Button$primary = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--primary');
var _MichaelCombs28$elm_mdl$Material_Button$colored = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--colored');
var _MichaelCombs28$elm_mdl$Material_Button$plain = _MichaelCombs28$elm_mdl$Material_Options$nop;
var _MichaelCombs28$elm_mdl$Material_Button$disabled = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{disabled: true});
	});
var _MichaelCombs28$elm_mdl$Material_Button$ripple = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{ripple: true});
	});
var _MichaelCombs28$elm_mdl$Material_Button$onClick = function (x) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					onClick: _elm_lang$core$Maybe$Just(
						_elm_lang$html$Html_Events$onClick(x))
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Button$defaultConfig = {ripple: false, onClick: _elm_lang$core$Maybe$Nothing, disabled: false, type_: _elm_lang$core$Maybe$Nothing};
var _MichaelCombs28$elm_mdl$Material_Button$view = F4(
	function (lift, model, config, html) {
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Button$defaultConfig, config);
		var startListeners = summary.config.ripple ? {
			ctor: '::',
			_0: _elm_lang$core$Maybe$Just(
				A2(_MichaelCombs28$elm_mdl$Material_Ripple$downOn_, lift, 'mousedown')),
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Maybe$Just(
					A2(_MichaelCombs28$elm_mdl$Material_Ripple$downOn_, lift, 'touchstart')),
				_1: {ctor: '[]'}
			}
		} : {ctor: '[]'};
		var stopListeners = function () {
			var handle = function (_p0) {
				return _elm_lang$core$Maybe$Just(
					(summary.config.ripple ? _MichaelCombs28$elm_mdl$Material_Button$blurAndForward : _MichaelCombs28$elm_mdl$Material_Helpers$blurOn)(_p0));
			};
			return {
				ctor: '::',
				_0: handle('mouseup'),
				_1: {
					ctor: '::',
					_0: handle('mouseleave'),
					_1: {
						ctor: '::',
						_0: handle('touchend'),
						_1: {ctor: '[]'}
					}
				}
			};
		}();
		var misc = {
			ctor: '::',
			_0: summary.config.onClick,
			_1: {
				ctor: '::',
				_0: summary.config.disabled ? _elm_lang$core$Maybe$Just(
					_elm_lang$html$Html_Attributes$disabled(true)) : _elm_lang$core$Maybe$Nothing,
				_1: {ctor: '[]'}
			}
		};
		var type_ = function () {
			var _p1 = summary.config.type_;
			if (_p1.ctor === 'Nothing') {
				return {ctor: '[]'};
			} else {
				return {
					ctor: '::',
					_0: _elm_lang$core$Maybe$Just(
						_elm_lang$html$Html_Attributes$type_(_p1._0)),
					_1: {ctor: '[]'}
				};
			}
		}();
		return A5(
			_MichaelCombs28$elm_mdl$Material_Options$apply,
			summary,
			_elm_lang$html$Html$button,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button'),
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-button'),
					_1: {
						ctor: '::',
						_0: A2(
							_MichaelCombs28$elm_mdl$Material_Options$when,
							_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-ripple-effect'),
							summary.config.ripple),
						_1: {ctor: '[]'}
					}
				}
			},
			A2(
				_elm_lang$core$List$filterMap,
				_elm_lang$core$Basics$identity,
				_elm_lang$core$List$concat(
					{
						ctor: '::',
						_0: startListeners,
						_1: {
							ctor: '::',
							_0: stopListeners,
							_1: {
								ctor: '::',
								_0: misc,
								_1: {
									ctor: '::',
									_0: type_,
									_1: {ctor: '[]'}
								}
							}
						}
					})),
			summary.config.ripple ? _elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: html,
					_1: {
						ctor: '::',
						_0: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$map,
								lift,
								A2(
									_MichaelCombs28$elm_mdl$Material_Ripple$view_,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('mdl-button__ripple-container'),
										_1: {
											ctor: '::',
											_0: _MichaelCombs28$elm_mdl$Material_Ripple$upOn('blur'),
											_1: {
												ctor: '::',
												_0: _MichaelCombs28$elm_mdl$Material_Ripple$upOn('touchcancel'),
												_1: {ctor: '[]'}
											}
										}
									},
									model)),
							_1: {ctor: '[]'}
						},
						_1: {ctor: '[]'}
					}
				}) : html);
	});
var _MichaelCombs28$elm_mdl$Material_Button$update = function (action) {
	return _MichaelCombs28$elm_mdl$Material_Ripple$update(action);
};
var _MichaelCombs28$elm_mdl$Material_Button$render = A5(
	_MichaelCombs28$elm_parts$Parts$create,
	_MichaelCombs28$elm_mdl$Material_Button$view,
	_MichaelCombs28$elm_parts$Parts$generalize(_MichaelCombs28$elm_mdl$Material_Button$update),
	function (_) {
		return _.button;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{button: x});
		}),
	_MichaelCombs28$elm_mdl$Material_Ripple$model);
var _MichaelCombs28$elm_mdl$Material_Button$defaultModel = _MichaelCombs28$elm_mdl$Material_Ripple$model;
var _MichaelCombs28$elm_mdl$Material_Button$Config = F4(
	function (a, b, c, d) {
		return {ripple: a, onClick: b, disabled: c, type_: d};
	});

var _MichaelCombs28$elm_mdl$Material_Icon$size48 = A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'font-size', '48px');
var _MichaelCombs28$elm_mdl$Material_Icon$size36 = A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'font-size', '36px');
var _MichaelCombs28$elm_mdl$Material_Icon$size24 = A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'font-size', '24px');
var _MichaelCombs28$elm_mdl$Material_Icon$size18 = A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'font-size', '18px');
var _MichaelCombs28$elm_mdl$Material_Icon$onClick = function (x) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					onClick: _elm_lang$core$Maybe$Just(
						_elm_lang$html$Html_Events$onClick(x))
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Icon$defaultConfig = {onClick: _elm_lang$core$Maybe$Nothing};
var _MichaelCombs28$elm_mdl$Material_Icon$view = F2(
	function (name, options) {
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Icon$defaultConfig, options);
		return A5(
			_MichaelCombs28$elm_mdl$Material_Options$apply,
			summary,
			_elm_lang$html$Html$i,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('material-icons'),
				_1: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$Maybe$withDefault,
				{ctor: '[]'},
				A2(
					_elm_lang$core$Maybe$map,
					A2(
						_elm_lang$core$Basics$flip,
						F2(
							function (x, y) {
								return {ctor: '::', _0: x, _1: y};
							}),
						{ctor: '[]'}),
					summary.config.onClick)),
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(name),
				_1: {ctor: '[]'}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Icon$i = function (name) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_Icon$view,
		name,
		{ctor: '[]'});
};
var _MichaelCombs28$elm_mdl$Material_Icon$Config = function (a) {
	return {onClick: a};
};

var _MichaelCombs28$elm_mdl$Material_Textfield$update = F2(
	function (action, model) {
		var _p0 = action;
		switch (_p0.ctor) {
			case 'Input':
				return _elm_lang$core$Native_Utils.update(
					model,
					{value: _p0._0});
			case 'Blur':
				return _elm_lang$core$Native_Utils.update(
					model,
					{isFocused: false});
			default:
				return _elm_lang$core$Native_Utils.update(
					model,
					{isFocused: true});
		}
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$defaultModel = {isFocused: false, value: ''};
var _MichaelCombs28$elm_mdl$Material_Textfield$cols = function (cols) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					cols: _elm_lang$core$Maybe$Just(cols)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Textfield$rows = function (rows) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					rows: _elm_lang$core$Maybe$Just(rows)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Textfield$style = _MichaelCombs28$elm_mdl$Material_Options$inner;
var _MichaelCombs28$elm_mdl$Material_Textfield$on = F2(
	function (event, decoder) {
		return _MichaelCombs28$elm_mdl$Material_Options$set(
			function (config) {
				return _elm_lang$core$Native_Utils.update(
					config,
					{
						listeners: A2(
							_elm_lang$core$Basics_ops['++'],
							config.listeners,
							{
								ctor: '::',
								_0: A2(_elm_lang$html$Html_Events$on, event, decoder),
								_1: {ctor: '[]'}
							})
					});
			});
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$onInput = function (f) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_Textfield$on,
		'input',
		A2(_elm_lang$core$Json_Decode$map, f, _elm_lang$html$Html_Events$targetValue));
};
var _MichaelCombs28$elm_mdl$Material_Textfield$onBlur = function (f) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_Textfield$on,
		'focusout',
		_elm_lang$core$Json_Decode$succeed(f));
};
var _MichaelCombs28$elm_mdl$Material_Textfield$onFocus = function (f) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_Textfield$on,
		'focusin',
		_elm_lang$core$Json_Decode$succeed(f));
};
var _MichaelCombs28$elm_mdl$Material_Textfield$disabled = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{disabled: true});
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$maxlength = function (v) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					maxlength: _elm_lang$core$Maybe$Just(v)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Textfield$autofocus = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{autofocus: true});
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$value = function (str) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					value: _elm_lang$core$Maybe$Just(str)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Textfield$error = function (str) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					error: _elm_lang$core$Maybe$Just(str)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Textfield$expandableIcon = function (id) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{expandableIcon: id});
		});
};
var _MichaelCombs28$elm_mdl$Material_Textfield$expandable = function (id) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					expandable: _elm_lang$core$Maybe$Just(id)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Textfield$floatingLabel = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{labelFloat: true});
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$label = function (str) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					labelText: _elm_lang$core$Maybe$Just(str)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Textfield$Config = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return function (m) {
													return function (n) {
														return {labelText: a, labelFloat: b, error: c, value: d, disabled: e, kind: f, rows: g, cols: h, autofocus: i, maxlength: j, inner: k, listeners: l, expandable: m, expandableIcon: n};
													};
												};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _MichaelCombs28$elm_mdl$Material_Textfield$Model = F2(
	function (a, b) {
		return {isFocused: a, value: b};
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$Password = {ctor: 'Password'};
var _MichaelCombs28$elm_mdl$Material_Textfield$password = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{kind: _MichaelCombs28$elm_mdl$Material_Textfield$Password});
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$Textarea = {ctor: 'Textarea'};
var _MichaelCombs28$elm_mdl$Material_Textfield$textarea = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{kind: _MichaelCombs28$elm_mdl$Material_Textfield$Textarea});
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$Text = {ctor: 'Text'};
var _MichaelCombs28$elm_mdl$Material_Textfield$defaultConfig = {
	labelText: _elm_lang$core$Maybe$Nothing,
	labelFloat: false,
	error: _elm_lang$core$Maybe$Nothing,
	value: _elm_lang$core$Maybe$Nothing,
	disabled: false,
	kind: _MichaelCombs28$elm_mdl$Material_Textfield$Text,
	rows: _elm_lang$core$Maybe$Nothing,
	cols: _elm_lang$core$Maybe$Nothing,
	autofocus: false,
	maxlength: _elm_lang$core$Maybe$Nothing,
	inner: {ctor: '[]'},
	listeners: {ctor: '[]'},
	expandable: _elm_lang$core$Maybe$Nothing,
	expandableIcon: 'search'
};
var _MichaelCombs28$elm_mdl$Material_Textfield$text_ = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{kind: _MichaelCombs28$elm_mdl$Material_Textfield$Text});
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$Input = function (a) {
	return {ctor: 'Input', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Textfield$Focus = {ctor: 'Focus'};
var _MichaelCombs28$elm_mdl$Material_Textfield$Blur = {ctor: 'Blur'};
var _MichaelCombs28$elm_mdl$Material_Textfield$view = F3(
	function (lift, model, options) {
		var _p1 = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Textfield$defaultConfig, options);
		var summary = _p1;
		var config = _p1.config;
		var val = A2(_elm_lang$core$Maybe$withDefault, model.value, config.value);
		var isTextarea = _elm_lang$core$Native_Utils.eq(config.kind, _MichaelCombs28$elm_mdl$Material_Textfield$Textarea);
		var elementFunction = isTextarea ? _elm_lang$html$Html$textarea : _elm_lang$html$Html$input;
		var typeAttributes = function () {
			var _p2 = config.kind;
			switch (_p2.ctor) {
				case 'Text':
					return {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('text'),
						_1: {ctor: '[]'}
					};
				case 'Password':
					return {
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('password'),
						_1: {ctor: '[]'}
					};
				default:
					return A2(
						_elm_lang$core$Basics_ops['++'],
						{ctor: '[]'},
						A2(
							_elm_lang$core$Basics_ops['++'],
							function () {
								var _p3 = config.rows;
								if (_p3.ctor === 'Just') {
									return {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$rows(_p3._0),
										_1: {ctor: '[]'}
									};
								} else {
									return {ctor: '[]'};
								}
							}(),
							function () {
								var _p4 = config.cols;
								if (_p4.ctor === 'Just') {
									return {
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$cols(_p4._0),
										_1: {ctor: '[]'}
									};
								} else {
									return {ctor: '[]'};
								}
							}()));
			}
		}();
		var maxlength = function () {
			var _p5 = config.maxlength;
			if (_p5.ctor === 'Just') {
				return {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$maxlength(_p5._0),
					_1: {ctor: '[]'}
				};
			} else {
				return {ctor: '[]'};
			}
		}();
		var listeners = config.listeners;
		var textValue = function () {
			var _p6 = config.value;
			if (_p6.ctor === 'Just') {
				return {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$value(_p6._0),
					_1: {ctor: '[]'}
				};
			} else {
				return {ctor: '[]'};
			}
		}();
		var defaultInput = function () {
			var _p7 = config.value;
			if (_p7.ctor === 'Just') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				return _elm_lang$core$Maybe$Just(
					A2(
						_elm_lang$html$Html_Events$on,
						'input',
						A2(
							_elm_lang$core$Json_Decode$map,
							function (_p8) {
								return lift(
									_MichaelCombs28$elm_mdl$Material_Textfield$Input(_p8));
							},
							_elm_lang$html$Html_Events$targetValue)));
			}
		}();
		var labelFor = function () {
			var _p9 = config.expandable;
			if (_p9.ctor === 'Nothing') {
				return {ctor: '[]'};
			} else {
				return {
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$for(_p9._0),
					_1: {ctor: '[]'}
				};
			}
		}();
		var expandableId = function () {
			var _p10 = config.expandable;
			if (_p10.ctor === 'Nothing') {
				return _MichaelCombs28$elm_mdl$Material_Options$nop;
			} else {
				return _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
					_elm_lang$html$Html_Attributes$id(_p10._0));
			}
		}();
		var expHolder = function () {
			var _p11 = config.expandable;
			if (_p11.ctor === 'Nothing') {
				return _elm_lang$core$Basics$identity;
			} else {
				return function (x) {
					return {
						ctor: '::',
						_0: A4(
							_MichaelCombs28$elm_mdl$Material_Options$styled_,
							_elm_lang$html$Html$label,
							{
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button'),
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-button'),
									_1: {
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--icon'),
										_1: {ctor: '[]'}
									}
								}
							},
							labelFor,
							{
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Icon$i(config.expandableIcon),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A3(
								_MichaelCombs28$elm_mdl$Material_Options$styled,
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-textfield__expandable-holder'),
									_1: {ctor: '[]'}
								},
								x),
							_1: {ctor: '[]'}
						}
					};
				};
			}
		}();
		return A5(
			_MichaelCombs28$elm_mdl$Material_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-textfield'),
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-textfield'),
					_1: {
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Options$cs('is-upgraded'),
						_1: {
							ctor: '::',
							_0: config.labelFloat ? _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-textfield--floating-label') : _MichaelCombs28$elm_mdl$Material_Options$nop,
							_1: {
								ctor: '::',
								_0: (!_elm_lang$core$Native_Utils.eq(config.error, _elm_lang$core$Maybe$Nothing)) ? _MichaelCombs28$elm_mdl$Material_Options$cs('is-invalid') : _MichaelCombs28$elm_mdl$Material_Options$nop,
								_1: {
									ctor: '::',
									_0: (!_elm_lang$core$Native_Utils.eq(val, '')) ? _MichaelCombs28$elm_mdl$Material_Options$cs('is-dirty') : _MichaelCombs28$elm_mdl$Material_Options$nop,
									_1: {
										ctor: '::',
										_0: (model.isFocused && (!config.disabled)) ? _MichaelCombs28$elm_mdl$Material_Options$cs('is-focused') : _MichaelCombs28$elm_mdl$Material_Options$nop,
										_1: {
											ctor: '::',
											_0: config.disabled ? _MichaelCombs28$elm_mdl$Material_Options$cs('is-disabled') : _MichaelCombs28$elm_mdl$Material_Options$nop,
											_1: {
												ctor: '::',
												_0: A2(
													_MichaelCombs28$elm_mdl$Material_Options$when,
													_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-textfield--expandable'),
													!_elm_lang$core$Native_Utils.eq(config.expandable, _elm_lang$core$Maybe$Nothing)),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						}
					}
				}
			},
			A2(
				_elm_lang$core$List$filterMap,
				_elm_lang$core$Basics$identity,
				{
					ctor: '::',
					_0: defaultInput,
					_1: {ctor: '[]'}
				}),
			expHolder(
				{
					ctor: '::',
					_0: A4(
						_MichaelCombs28$elm_mdl$Material_Options$styled_,
						elementFunction,
						{
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-textfield__input'),
							_1: {
								ctor: '::',
								_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'outline', 'none'),
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
										A2(
											_elm_lang$html$Html_Events$on,
											'focus',
											_elm_lang$core$Json_Decode$succeed(
												lift(_MichaelCombs28$elm_mdl$Material_Textfield$Focus)))),
									_1: {
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
											A2(
												_elm_lang$html$Html_Events$on,
												'blur',
												_elm_lang$core$Json_Decode$succeed(
													lift(_MichaelCombs28$elm_mdl$Material_Textfield$Blur)))),
										_1: {
											ctor: '::',
											_0: expandableId,
											_1: {
												ctor: '::',
												_0: _MichaelCombs28$elm_mdl$Material_Options$many(config.inner),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						},
						A2(
							_elm_lang$core$Basics_ops['++'],
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$disabled(config.disabled),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$autofocus(config.autofocus),
									_1: {ctor: '[]'}
								}
							},
							A2(
								_elm_lang$core$Basics_ops['++'],
								textValue,
								A2(
									_elm_lang$core$Basics_ops['++'],
									typeAttributes,
									A2(_elm_lang$core$Basics_ops['++'], maxlength, listeners)))),
						{ctor: '[]'}),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$label,
							A2(
								_elm_lang$core$Basics_ops['++'],
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('mdl-textfield__label'),
									_1: {ctor: '[]'}
								},
								labelFor),
							function () {
								var _p12 = config.labelText;
								if (_p12.ctor === 'Just') {
									return {
										ctor: '::',
										_0: _elm_lang$html$Html$text(_p12._0),
										_1: {ctor: '[]'}
									};
								} else {
									return {ctor: '[]'};
								}
							}()),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$core$Maybe$withDefault,
								A2(
									_elm_lang$html$Html$div,
									{ctor: '[]'},
									{ctor: '[]'}),
								A2(
									_elm_lang$core$Maybe$map,
									function (e) {
										return A2(
											_elm_lang$html$Html$span,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('mdl-textfield__error'),
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text(e),
												_1: {ctor: '[]'}
											});
									},
									config.error)),
							_1: {ctor: '[]'}
						}
					}
				}));
	});
var _MichaelCombs28$elm_mdl$Material_Textfield$render = A5(
	_MichaelCombs28$elm_parts$Parts$create,
	_MichaelCombs28$elm_mdl$Material_Textfield$view,
	F3(
		function (_p13, msg, model) {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Maybe$Just(
					A2(_MichaelCombs28$elm_mdl$Material_Textfield$update, msg, model)),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		}),
	function (_) {
		return _.textfield;
	},
	F2(
		function (x, c) {
			return _elm_lang$core$Native_Utils.update(
				c,
				{textfield: x});
		}),
	_MichaelCombs28$elm_mdl$Material_Textfield$defaultModel);

var _elm_lang$dom$Native_Dom = function() {

var fakeNode = {
	addEventListener: function() {},
	removeEventListener: function() {}
};

var onDocument = on(typeof document !== 'undefined' ? document : fakeNode);
var onWindow = on(typeof window !== 'undefined' ? window : fakeNode);

function on(node)
{
	return function(eventName, decoder, toTask)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {

			function performTask(event)
			{
				var result = A2(_elm_lang$core$Json_Decode$decodeValue, decoder, event);
				if (result.ctor === 'Ok')
				{
					_elm_lang$core$Native_Scheduler.rawSpawn(toTask(result._0));
				}
			}

			node.addEventListener(eventName, performTask);

			return function()
			{
				node.removeEventListener(eventName, performTask);
			};
		});
	};
}

var rAF = typeof requestAnimationFrame !== 'undefined'
	? requestAnimationFrame
	: function(callback) { callback(); };

function withNode(id, doStuff)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		rAF(function()
		{
			var node = document.getElementById(id);
			if (node === null)
			{
				callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NotFound', _0: id }));
				return;
			}
			callback(_elm_lang$core$Native_Scheduler.succeed(doStuff(node)));
		});
	});
}


// FOCUS

function focus(id)
{
	return withNode(id, function(node) {
		node.focus();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function blur(id)
{
	return withNode(id, function(node) {
		node.blur();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SCROLLING

function getScrollTop(id)
{
	return withNode(id, function(node) {
		return node.scrollTop;
	});
}

function setScrollTop(id, desiredScrollTop)
{
	return withNode(id, function(node) {
		node.scrollTop = desiredScrollTop;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toBottom(id)
{
	return withNode(id, function(node) {
		node.scrollTop = node.scrollHeight;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function getScrollLeft(id)
{
	return withNode(id, function(node) {
		return node.scrollLeft;
	});
}

function setScrollLeft(id, desiredScrollLeft)
{
	return withNode(id, function(node) {
		node.scrollLeft = desiredScrollLeft;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toRight(id)
{
	return withNode(id, function(node) {
		node.scrollLeft = node.scrollWidth;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SIZE

function width(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollWidth;
			case 'VisibleContent':
				return node.clientWidth;
			case 'VisibleContentWithBorders':
				return node.offsetWidth;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.right - rect.left;
		}
	});
}

function height(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollHeight;
			case 'VisibleContent':
				return node.clientHeight;
			case 'VisibleContentWithBorders':
				return node.offsetHeight;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.bottom - rect.top;
		}
	});
}

return {
	onDocument: F3(onDocument),
	onWindow: F3(onWindow),

	focus: focus,
	blur: blur,

	getScrollTop: getScrollTop,
	setScrollTop: F2(setScrollTop),
	getScrollLeft: getScrollLeft,
	setScrollLeft: F2(setScrollLeft),
	toBottom: toBottom,
	toRight: toRight,

	height: F2(height),
	width: F2(width)
};

}();

var _elm_lang$dom$Dom_LowLevel$onWindow = _elm_lang$dom$Native_Dom.onWindow;
var _elm_lang$dom$Dom_LowLevel$onDocument = _elm_lang$dom$Native_Dom.onDocument;

var _elm_lang$mouse$Mouse_ops = _elm_lang$mouse$Mouse_ops || {};
_elm_lang$mouse$Mouse_ops['&>'] = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return t2;
			},
			t1);
	});
var _elm_lang$mouse$Mouse$onSelfMsg = F3(
	function (router, _p1, state) {
		var _p2 = _p1;
		var _p3 = A2(_elm_lang$core$Dict$get, _p2.category, state);
		if (_p3.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var send = function (tagger) {
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					tagger(_p2.position));
			};
			return A2(
				_elm_lang$mouse$Mouse_ops['&>'],
				_elm_lang$core$Task$sequence(
					A2(_elm_lang$core$List$map, send, _p3._0.taggers)),
				_elm_lang$core$Task$succeed(state));
		}
	});
var _elm_lang$mouse$Mouse$init = _elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty);
var _elm_lang$mouse$Mouse$categorizeHelpHelp = F2(
	function (value, maybeValues) {
		var _p4 = maybeValues;
		if (_p4.ctor === 'Nothing') {
			return _elm_lang$core$Maybe$Just(
				{
					ctor: '::',
					_0: value,
					_1: {ctor: '[]'}
				});
		} else {
			return _elm_lang$core$Maybe$Just(
				{ctor: '::', _0: value, _1: _p4._0});
		}
	});
var _elm_lang$mouse$Mouse$categorizeHelp = F2(
	function (subs, subDict) {
		categorizeHelp:
		while (true) {
			var _p5 = subs;
			if (_p5.ctor === '[]') {
				return subDict;
			} else {
				var _v4 = _p5._1,
					_v5 = A3(
					_elm_lang$core$Dict$update,
					_p5._0._0,
					_elm_lang$mouse$Mouse$categorizeHelpHelp(_p5._0._1),
					subDict);
				subs = _v4;
				subDict = _v5;
				continue categorizeHelp;
			}
		}
	});
var _elm_lang$mouse$Mouse$categorize = function (subs) {
	return A2(_elm_lang$mouse$Mouse$categorizeHelp, subs, _elm_lang$core$Dict$empty);
};
var _elm_lang$mouse$Mouse$subscription = _elm_lang$core$Native_Platform.leaf('Mouse');
var _elm_lang$mouse$Mouse$Position = F2(
	function (a, b) {
		return {x: a, y: b};
	});
var _elm_lang$mouse$Mouse$position = A3(
	_elm_lang$core$Json_Decode$map2,
	_elm_lang$mouse$Mouse$Position,
	A2(_elm_lang$core$Json_Decode$field, 'pageX', _elm_lang$core$Json_Decode$int),
	A2(_elm_lang$core$Json_Decode$field, 'pageY', _elm_lang$core$Json_Decode$int));
var _elm_lang$mouse$Mouse$Watcher = F2(
	function (a, b) {
		return {taggers: a, pid: b};
	});
var _elm_lang$mouse$Mouse$Msg = F2(
	function (a, b) {
		return {category: a, position: b};
	});
var _elm_lang$mouse$Mouse$onEffects = F3(
	function (router, newSubs, oldState) {
		var rightStep = F3(
			function (category, taggers, task) {
				var tracker = A3(
					_elm_lang$dom$Dom_LowLevel$onDocument,
					category,
					_elm_lang$mouse$Mouse$position,
					function (_p6) {
						return A2(
							_elm_lang$core$Platform$sendToSelf,
							router,
							A2(_elm_lang$mouse$Mouse$Msg, category, _p6));
					});
				return A2(
					_elm_lang$core$Task$andThen,
					function (state) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (pid) {
								return _elm_lang$core$Task$succeed(
									A3(
										_elm_lang$core$Dict$insert,
										category,
										A2(_elm_lang$mouse$Mouse$Watcher, taggers, pid),
										state));
							},
							_elm_lang$core$Process$spawn(tracker));
					},
					task);
			});
		var bothStep = F4(
			function (category, _p7, taggers, task) {
				var _p8 = _p7;
				return A2(
					_elm_lang$core$Task$andThen,
					function (state) {
						return _elm_lang$core$Task$succeed(
							A3(
								_elm_lang$core$Dict$insert,
								category,
								A2(_elm_lang$mouse$Mouse$Watcher, taggers, _p8.pid),
								state));
					},
					task);
			});
		var leftStep = F3(
			function (category, _p9, task) {
				var _p10 = _p9;
				return A2(
					_elm_lang$mouse$Mouse_ops['&>'],
					_elm_lang$core$Process$kill(_p10.pid),
					task);
			});
		return A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			oldState,
			_elm_lang$mouse$Mouse$categorize(newSubs),
			_elm_lang$core$Task$succeed(_elm_lang$core$Dict$empty));
	});
var _elm_lang$mouse$Mouse$MySub = F2(
	function (a, b) {
		return {ctor: 'MySub', _0: a, _1: b};
	});
var _elm_lang$mouse$Mouse$clicks = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'click', tagger));
};
var _elm_lang$mouse$Mouse$moves = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mousemove', tagger));
};
var _elm_lang$mouse$Mouse$downs = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mousedown', tagger));
};
var _elm_lang$mouse$Mouse$ups = function (tagger) {
	return _elm_lang$mouse$Mouse$subscription(
		A2(_elm_lang$mouse$Mouse$MySub, 'mouseup', tagger));
};
var _elm_lang$mouse$Mouse$subMap = F2(
	function (func, _p11) {
		var _p12 = _p11;
		return A2(
			_elm_lang$mouse$Mouse$MySub,
			_p12._0,
			function (_p13) {
				return func(
					_p12._1(_p13));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Mouse'] = {pkg: 'elm-lang/mouse', init: _elm_lang$mouse$Mouse$init, onEffects: _elm_lang$mouse$Mouse$onEffects, onSelfMsg: _elm_lang$mouse$Mouse$onSelfMsg, tag: 'sub', subMap: _elm_lang$mouse$Mouse$subMap};

var _MichaelCombs28$elm_mdl$Material_Menu_Geometry$Geometry = F5(
	function (a, b, c, d, e) {
		return {button: a, menu: b, container: c, offsetTops: d, offsetHeights: e};
	});
var _MichaelCombs28$elm_mdl$Material_Menu_Geometry$Element = F4(
	function (a, b, c, d) {
		return {offsetTop: a, offsetLeft: b, offsetHeight: c, bounds: d};
	});
var _MichaelCombs28$elm_mdl$Material_Menu_Geometry$element = A5(_elm_lang$core$Json_Decode$map4, _MichaelCombs28$elm_mdl$Material_Menu_Geometry$Element, _MichaelCombs28$elm_dom$DOM$offsetTop, _MichaelCombs28$elm_dom$DOM$offsetLeft, _MichaelCombs28$elm_dom$DOM$offsetHeight, _MichaelCombs28$elm_dom$DOM$boundingClientRect);
var _MichaelCombs28$elm_mdl$Material_Menu_Geometry$decode = A6(
	_elm_lang$core$Json_Decode$map5,
	_MichaelCombs28$elm_mdl$Material_Menu_Geometry$Geometry,
	_MichaelCombs28$elm_dom$DOM$target(_MichaelCombs28$elm_mdl$Material_Menu_Geometry$element),
	_MichaelCombs28$elm_dom$DOM$target(
		_MichaelCombs28$elm_dom$DOM$nextSibling(
			A2(_MichaelCombs28$elm_dom$DOM$childNode, 1, _MichaelCombs28$elm_mdl$Material_Menu_Geometry$element))),
	_MichaelCombs28$elm_dom$DOM$target(
		_MichaelCombs28$elm_dom$DOM$nextSibling(_MichaelCombs28$elm_mdl$Material_Menu_Geometry$element)),
	_MichaelCombs28$elm_dom$DOM$target(
		_MichaelCombs28$elm_dom$DOM$nextSibling(
			A2(
				_MichaelCombs28$elm_dom$DOM$childNode,
				1,
				_MichaelCombs28$elm_dom$DOM$childNodes(_MichaelCombs28$elm_dom$DOM$offsetTop)))),
	_MichaelCombs28$elm_dom$DOM$target(
		_MichaelCombs28$elm_dom$DOM$nextSibling(
			A2(
				_MichaelCombs28$elm_dom$DOM$childNode,
				1,
				_MichaelCombs28$elm_dom$DOM$childNodes(_MichaelCombs28$elm_dom$DOM$offsetHeight)))));

var _MichaelCombs28$elm_mdl$Material_Menu$toPx = function (_p0) {
	return A3(
		_elm_lang$core$Basics$flip,
		F2(
			function (x, y) {
				return A2(_elm_lang$core$Basics_ops['++'], x, y);
			}),
		'px',
		_elm_lang$core$Basics$toString(_p0));
};
var _MichaelCombs28$elm_mdl$Material_Menu$rect = F4(
	function (x, y, w, h) {
		return function (coords) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'rect(',
				A2(_elm_lang$core$Basics_ops['++'], coords, ')'));
		}(
			A2(
				_elm_lang$core$String$join,
				' ',
				A2(
					_elm_lang$core$List$map,
					_MichaelCombs28$elm_mdl$Material_Menu$toPx,
					{
						ctor: '::',
						_0: x,
						_1: {
							ctor: '::',
							_0: y,
							_1: {
								ctor: '::',
								_0: w,
								_1: {
									ctor: '::',
									_0: h,
									_1: {ctor: '[]'}
								}
							}
						}
					})));
	});
var _MichaelCombs28$elm_mdl$Material_Menu$onKeyDown = function (action) {
	return A3(
		_elm_lang$html$Html_Events$onWithOptions,
		'keydown',
		{preventDefault: true, stopPropagation: false},
		A2(_elm_lang$core$Json_Decode$map, action, _elm_lang$html$Html_Events$keyCode));
};
var _MichaelCombs28$elm_mdl$Material_Menu$onClick = F2(
	function (decoder, action) {
		return A2(
			_elm_lang$html$Html_Events$on,
			'click',
			A2(_elm_lang$core$Json_Decode$map, action, decoder));
	});
var _MichaelCombs28$elm_mdl$Material_Menu$withGeometry = F2(
	function (model, f) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			_MichaelCombs28$elm_mdl$Material_Options$nop,
			A2(_elm_lang$core$Maybe$map, f, model.geometry));
	});
var _MichaelCombs28$elm_mdl$Material_Menu$icon = function (name) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{icon: name});
		});
};
var _MichaelCombs28$elm_mdl$Material_Menu$ripple = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{ripple: true});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$onSelect = function (msg) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					onSelect: _elm_lang$core$Maybe$Just(msg)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Menu$disabled = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{enabled: false});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$divider = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{divider: true});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$defaultItemConfig = {enabled: true, divider: false, onSelect: _elm_lang$core$Maybe$Nothing};
var _MichaelCombs28$elm_mdl$Material_Menu$constant = {transitionDurationSeconds: 0.3, transitionDurationFraction: 0.8, closeTimeout: 150};
var _MichaelCombs28$elm_mdl$Material_Menu$transitionDuration = _MichaelCombs28$elm_mdl$Material_Menu$constant.transitionDurationSeconds * _MichaelCombs28$elm_mdl$Material_Menu$constant.transitionDurationFraction;
var _MichaelCombs28$elm_mdl$Material_Menu$Model = F4(
	function (a, b, c, d) {
		return {ripples: a, animationState: b, geometry: c, index: d};
	});
var _MichaelCombs28$elm_mdl$Material_Menu$Item = F2(
	function (a, b) {
		return {options: a, html: b};
	});
var _MichaelCombs28$elm_mdl$Material_Menu$item = _MichaelCombs28$elm_mdl$Material_Menu$Item;
var _MichaelCombs28$elm_mdl$Material_Menu$ItemConfig = F3(
	function (a, b, c) {
		return {enabled: a, divider: b, onSelect: c};
	});
var _MichaelCombs28$elm_mdl$Material_Menu$Config = F3(
	function (a, b, c) {
		return {alignment: a, ripple: b, icon: c};
	});
var _MichaelCombs28$elm_mdl$Material_Menu$Closing = {ctor: 'Closing'};
var _MichaelCombs28$elm_mdl$Material_Menu$Opened = {ctor: 'Opened'};
var _MichaelCombs28$elm_mdl$Material_Menu$clip = F3(
	function (model, config, geometry) {
		var height = geometry.menu.bounds.height;
		var width = geometry.menu.bounds.width;
		return A2(
			_MichaelCombs28$elm_mdl$Material_Options$css,
			'clip',
			function () {
				if (_elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Opened) || _elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Closing)) {
					return A4(_MichaelCombs28$elm_mdl$Material_Menu$rect, 0, width, height, 0);
				} else {
					var _p1 = config.alignment;
					switch (_p1.ctor) {
						case 'BottomRight':
							return A4(_MichaelCombs28$elm_mdl$Material_Menu$rect, 0, width, 0, width);
						case 'TopLeft':
							return A4(_MichaelCombs28$elm_mdl$Material_Menu$rect, height, 0, height, 0);
						case 'TopRight':
							return A4(_MichaelCombs28$elm_mdl$Material_Menu$rect, height, width, height, width);
						default:
							return '';
					}
				}
			}());
	});
var _MichaelCombs28$elm_mdl$Material_Menu$Opening = {ctor: 'Opening'};
var _MichaelCombs28$elm_mdl$Material_Menu$isActive = function (model) {
	return _elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Opened) || _elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Opening);
};
var _MichaelCombs28$elm_mdl$Material_Menu$Idle = {ctor: 'Idle'};
var _MichaelCombs28$elm_mdl$Material_Menu$defaultModel = {ripples: _elm_lang$core$Dict$empty, animationState: _MichaelCombs28$elm_mdl$Material_Menu$Idle, geometry: _elm_lang$core$Maybe$Nothing, index: _elm_lang$core$Maybe$Nothing};
var _MichaelCombs28$elm_mdl$Material_Menu$Key = F2(
	function (a, b) {
		return {ctor: 'Key', _0: a, _1: b};
	});
var _MichaelCombs28$elm_mdl$Material_Menu$Click = function (a) {
	return {ctor: 'Click', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Menu$subscriptions = function (model) {
	return _elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Opened) ? _elm_lang$mouse$Mouse$clicks(_MichaelCombs28$elm_mdl$Material_Menu$Click) : _elm_lang$core$Platform_Sub$none;
};
var _MichaelCombs28$elm_mdl$Material_Menu$Ripple = F2(
	function (a, b) {
		return {ctor: 'Ripple', _0: a, _1: b};
	});
var _MichaelCombs28$elm_mdl$Material_Menu$Tick = {ctor: 'Tick'};
var _MichaelCombs28$elm_mdl$Material_Menu$Close = {ctor: 'Close'};
var _MichaelCombs28$elm_mdl$Material_Menu$Select = F2(
	function (a, b) {
		return {ctor: 'Select', _0: a, _1: b};
	});
var _MichaelCombs28$elm_mdl$Material_Menu$update = F3(
	function (fwd, msg, model) {
		update:
		while (true) {
			var _p2 = msg;
			switch (_p2.ctor) {
				case 'Open':
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{
								animationState: function () {
									var _p3 = model.animationState;
									if (_p3.ctor === 'Opened') {
										return _MichaelCombs28$elm_mdl$Material_Menu$Opened;
									} else {
										return _MichaelCombs28$elm_mdl$Material_Menu$Opening;
									}
								}(),
								geometry: _elm_lang$core$Maybe$Just(_p2._0)
							}),
						_1: _MichaelCombs28$elm_mdl$Material_Helpers$cmd(
							fwd(_MichaelCombs28$elm_mdl$Material_Menu$Tick))
					};
				case 'Tick':
					return _MichaelCombs28$elm_mdl$Material_Helpers$pure(
						_elm_lang$core$Native_Utils.update(
							model,
							{animationState: _MichaelCombs28$elm_mdl$Material_Menu$Opened}));
				case 'Close':
					return _MichaelCombs28$elm_mdl$Material_Helpers$pure(
						_elm_lang$core$Native_Utils.update(
							model,
							{animationState: _MichaelCombs28$elm_mdl$Material_Menu$Idle, geometry: _elm_lang$core$Maybe$Nothing, index: _elm_lang$core$Maybe$Nothing}));
				case 'Select':
					var cmds = A2(
						_elm_lang$core$List$filterMap,
						_elm_lang$core$Basics$identity,
						{
							ctor: '::',
							_0: _elm_lang$core$Maybe$Just(
								A2(
									_MichaelCombs28$elm_mdl$Material_Helpers$delay,
									_MichaelCombs28$elm_mdl$Material_Menu$constant.closeTimeout,
									fwd(_MichaelCombs28$elm_mdl$Material_Menu$Close))),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$core$Maybe$map, _MichaelCombs28$elm_mdl$Material_Helpers$cmd, _p2._1),
								_1: {ctor: '[]'}
							}
						});
					var model_ = _elm_lang$core$Native_Utils.update(
						model,
						{animationState: _MichaelCombs28$elm_mdl$Material_Menu$Closing});
					return {
						ctor: '_Tuple2',
						_0: model_,
						_1: _elm_lang$core$Platform_Cmd$batch(cmds)
					};
				case 'Ripple':
					var _p6 = _p2._0;
					var _p4 = A2(
						_MichaelCombs28$elm_mdl$Material_Ripple$update,
						_p2._1,
						A2(
							_elm_lang$core$Maybe$withDefault,
							_MichaelCombs28$elm_mdl$Material_Ripple$model,
							A2(_elm_lang$core$Dict$get, _p6, model.ripples)));
					var model_ = _p4._0;
					var effects = _p4._1;
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{
								ripples: A3(_elm_lang$core$Dict$insert, _p6, model_, model.ripples)
							}),
						_1: A2(
							_elm_lang$core$Platform_Cmd$map,
							function (_p5) {
								return fwd(
									A2(_MichaelCombs28$elm_mdl$Material_Menu$Ripple, _p6, _p5));
							},
							effects)
					};
				case 'Click':
					if (_MichaelCombs28$elm_mdl$Material_Menu$isActive(model)) {
						var _p7 = model.geometry;
						if (_p7.ctor === 'Just') {
							var inside = F2(
								function (_p9, _p8) {
									var _p10 = _p9;
									var _p15 = _p10.y;
									var _p14 = _p10.x;
									var _p11 = _p8;
									var _p13 = _p11.top;
									var _p12 = _p11.left;
									return (_elm_lang$core$Native_Utils.cmp(
										_p12,
										_elm_lang$core$Basics$toFloat(_p14)) < 1) && ((_elm_lang$core$Native_Utils.cmp(
										_elm_lang$core$Basics$toFloat(_p14),
										_p12 + _p11.width) < 1) && ((_elm_lang$core$Native_Utils.cmp(
										_p13,
										_elm_lang$core$Basics$toFloat(_p15)) < 1) && (_elm_lang$core$Native_Utils.cmp(
										_elm_lang$core$Basics$toFloat(_p15),
										_p13 + _p11.height) < 1)));
								});
							if (A2(inside, _p2._0, _p7._0.menu.bounds)) {
								return A2(
									_elm_lang$core$Platform_Cmd_ops['!'],
									model,
									{ctor: '[]'});
							} else {
								var _v6 = fwd,
									_v7 = _MichaelCombs28$elm_mdl$Material_Menu$Close,
									_v8 = model;
								fwd = _v6;
								msg = _v7;
								model = _v8;
								continue update;
							}
						} else {
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								model,
								{ctor: '[]'});
						}
					} else {
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							model,
							{ctor: '[]'});
					}
				default:
					var _p24 = _p2._0;
					var _p16 = _p2._1;
					switch (_p16) {
						case 13:
							if (_MichaelCombs28$elm_mdl$Material_Menu$isActive(model)) {
								var _p17 = model.index;
								if (_p17.ctor === 'Just') {
									var _p19 = _p17._0;
									var cmd = A2(
										_elm_lang$core$Maybe$andThen,
										function (_p18) {
											return function (_) {
												return _.onSelect;
											}(
												function (_) {
													return _.config;
												}(_p18));
										},
										_elm_lang$core$List$head(
											A2(_elm_lang$core$List$drop, _p19, _p24)));
									var _v11 = fwd,
										_v12 = A2(_MichaelCombs28$elm_mdl$Material_Menu$Select, _p19 + 1, cmd),
										_v13 = model;
									fwd = _v11;
									msg = _v12;
									model = _v13;
									continue update;
								} else {
									var _v14 = fwd,
										_v15 = _MichaelCombs28$elm_mdl$Material_Menu$Close,
										_v16 = model;
									fwd = _v14;
									msg = _v15;
									model = _v16;
									continue update;
								}
							} else {
								return A2(
									_elm_lang$core$Platform_Cmd_ops['!'],
									model,
									{ctor: '[]'});
							}
						case 27:
							var _v17 = fwd,
								_v18 = _MichaelCombs28$elm_mdl$Material_Menu$Close,
								_v19 = model;
							fwd = _v17;
							msg = _v18;
							model = _v19;
							continue update;
						case 32:
							if (_MichaelCombs28$elm_mdl$Material_Menu$isActive(model)) {
								var _v20 = fwd,
									_v21 = A2(_MichaelCombs28$elm_mdl$Material_Menu$Key, _p24, 13),
									_v22 = model;
								fwd = _v20;
								msg = _v21;
								model = _v22;
								continue update;
							} else {
								return A2(
									_elm_lang$core$Platform_Cmd_ops['!'],
									model,
									{ctor: '[]'});
							}
						case 40:
							if (_MichaelCombs28$elm_mdl$Material_Menu$isActive(model)) {
								var items = A2(
									_elm_lang$core$List$indexedMap,
									F2(
										function (v0, v1) {
											return {ctor: '_Tuple2', _0: v0, _1: v1};
										}),
									_p24);
								return A3(
									_elm_lang$core$Basics$flip,
									F2(
										function (x, y) {
											return A2(_elm_lang$core$Platform_Cmd_ops['!'], x, y);
										}),
									{ctor: '[]'},
									A2(
										_elm_lang$core$Maybe$withDefault,
										model,
										A2(
											_elm_lang$core$Maybe$map,
											function (_p20) {
												return function (index_) {
													return _elm_lang$core$Native_Utils.update(
														model,
														{
															index: _elm_lang$core$Maybe$Just(index_)
														});
												}(
													_elm_lang$core$Tuple$first(_p20));
											},
											_elm_lang$core$List$head(
												A2(
													_elm_lang$core$List$filter,
													function (_p21) {
														return function (_) {
															return _.enabled;
														}(
															function (_) {
																return _.config;
															}(
																_elm_lang$core$Tuple$second(_p21)));
													},
													A2(
														_elm_lang$core$List$drop,
														1 + A2(_elm_lang$core$Maybe$withDefault, -1, model.index),
														A2(_elm_lang$core$Basics_ops['++'], items, items)))))));
							} else {
								return A2(
									_elm_lang$core$Platform_Cmd_ops['!'],
									model,
									{ctor: '[]'});
							}
						case 38:
							if (_MichaelCombs28$elm_mdl$Material_Menu$isActive(model)) {
								var items = A2(
									_elm_lang$core$List$indexedMap,
									F2(
										function (v0, v1) {
											return {ctor: '_Tuple2', _0: v0, _1: v1};
										}),
									_p24);
								return _MichaelCombs28$elm_mdl$Material_Helpers$pure(
									A2(
										_elm_lang$core$Maybe$withDefault,
										model,
										A2(
											_elm_lang$core$Maybe$map,
											function (_p22) {
												return function (index_) {
													return _elm_lang$core$Native_Utils.update(
														model,
														{
															index: _elm_lang$core$Maybe$Just(index_)
														});
												}(
													_elm_lang$core$Tuple$first(_p22));
											},
											_elm_lang$core$List$head(
												A2(
													_elm_lang$core$List$filter,
													function (_p23) {
														return function (_) {
															return _.enabled;
														}(
															function (_) {
																return _.config;
															}(
																_elm_lang$core$Tuple$second(_p23)));
													},
													A2(
														_elm_lang$core$List$drop,
														_elm_lang$core$List$length(_p24) - A2(_elm_lang$core$Maybe$withDefault, 0, model.index),
														_elm_lang$core$List$reverse(
															A2(_elm_lang$core$Basics_ops['++'], items, items))))))));
							} else {
								return A2(
									_elm_lang$core$Platform_Cmd_ops['!'],
									model,
									{ctor: '[]'});
							}
						default:
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								model,
								{ctor: '[]'});
					}
			}
		}
	});
var _MichaelCombs28$elm_mdl$Material_Menu$update_ = F3(
	function (fwd, msg, model) {
		return _MichaelCombs28$elm_mdl$Material_Helpers$partsUpdatePort(
			_elm_lang$core$Maybe$Just(
				A3(_MichaelCombs28$elm_mdl$Material_Menu$update, fwd, msg, model)));
	});
var _MichaelCombs28$elm_mdl$Material_Menu$pack = A4(
	_MichaelCombs28$elm_parts$Parts$pack,
	_MichaelCombs28$elm_mdl$Material_Menu$update_,
	function (_) {
		return _.menu;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{menu: x});
		}),
	_MichaelCombs28$elm_mdl$Material_Menu$defaultModel);
var _MichaelCombs28$elm_mdl$Material_Menu$subs = function (lift) {
	return function (_p25) {
		return _elm_lang$core$Platform_Sub$batch(
			A3(
				_elm_lang$core$Dict$foldl,
				F3(
					function (idx, model, ss) {
						return {
							ctor: '::',
							_0: A2(
								_elm_lang$core$Platform_Sub$map,
								A2(_MichaelCombs28$elm_mdl$Material_Menu$pack, lift, idx),
								_MichaelCombs28$elm_mdl$Material_Menu$subscriptions(model)),
							_1: ss
						};
					}),
				{ctor: '[]'},
				function (_) {
					return _.menu;
				}(_p25)));
	};
};
var _MichaelCombs28$elm_mdl$Material_Menu$Open = function (a) {
	return {ctor: 'Open', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Menu$TopRight = {ctor: 'TopRight'};
var _MichaelCombs28$elm_mdl$Material_Menu$topRight = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{alignment: _MichaelCombs28$elm_mdl$Material_Menu$TopRight});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$TopLeft = {ctor: 'TopLeft'};
var _MichaelCombs28$elm_mdl$Material_Menu$topLeft = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{alignment: _MichaelCombs28$elm_mdl$Material_Menu$TopLeft});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$delay = F4(
	function (alignment, height, offsetTop, offsetHeight) {
		var t = (_elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$TopLeft) || _elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$TopRight)) ? ((((height - offsetTop) - offsetHeight) / height) * _MichaelCombs28$elm_mdl$Material_Menu$transitionDuration) : ((offsetTop / height) * _MichaelCombs28$elm_mdl$Material_Menu$transitionDuration);
		return A2(
			_MichaelCombs28$elm_mdl$Material_Options$css,
			'transition-delay',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(t),
				's'));
	});
var _MichaelCombs28$elm_mdl$Material_Menu$view1 = F8(
	function (lift, config, model, offsetTop, offsetHeight, index, summary, item) {
		var canSelect = summary.config.enabled && (!_elm_lang$core$Native_Utils.eq(summary.config.onSelect, _elm_lang$core$Maybe$Nothing));
		var hasRipple = config.ripple && canSelect;
		var ripple = function (_p26) {
			return lift(
				A2(_MichaelCombs28$elm_mdl$Material_Menu$Ripple, index, _p26));
		};
		return A5(
			_MichaelCombs28$elm_mdl$Material_Options$apply,
			summary,
			_elm_lang$html$Html$li,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu__item'),
				_1: {
					ctor: '::',
					_0: A2(
						_MichaelCombs28$elm_mdl$Material_Options$when,
						_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-ripple-effect'),
						config.ripple),
					_1: {
						ctor: '::',
						_0: A2(
							_MichaelCombs28$elm_mdl$Material_Options$when,
							_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu__item--full-bleed-divider'),
							summary.config.divider),
						_1: {
							ctor: '::',
							_0: A2(
								_MichaelCombs28$elm_mdl$Material_Options$when,
								A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'background-color', 'rgb(238,238,238)'),
								_elm_lang$core$Native_Utils.eq(
									model.index,
									_elm_lang$core$Maybe$Just(index))),
							_1: {
								ctor: '::',
								_0: function () {
									var _p27 = {
										ctor: '_Tuple2',
										_0: model.geometry,
										_1: _MichaelCombs28$elm_mdl$Material_Menu$isActive(model)
									};
									if (((_p27.ctor === '_Tuple2') && (_p27._0.ctor === 'Just')) && (_p27._1 === true)) {
										return A4(_MichaelCombs28$elm_mdl$Material_Menu$delay, config.alignment, _p27._0._0.menu.bounds.height, offsetTop, offsetHeight);
									} else {
										return _MichaelCombs28$elm_mdl$Material_Options$nop;
									}
								}(),
								_1: {
									ctor: '::',
									_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'display', 'flex'),
									_1: {
										ctor: '::',
										_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'align-items', 'center'),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			},
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$List$filterMap,
					_elm_lang$core$Basics$identity,
					{
						ctor: '::',
						_0: canSelect ? _elm_lang$core$Maybe$Just(
							_elm_lang$html$Html_Events$onClick(
								lift(
									A2(_MichaelCombs28$elm_mdl$Material_Menu$Select, index, summary.config.onSelect)))) : _elm_lang$core$Maybe$Nothing,
						_1: {
							ctor: '::',
							_0: (!summary.config.enabled) ? _elm_lang$core$Maybe$Just(
								A2(_elm_lang$html$Html_Attributes$attribute, 'disabled', 'disabled')) : _elm_lang$core$Maybe$Nothing,
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Maybe$Just(
									A2(
										_elm_lang$html$Html_Attributes$property,
										'tabindex',
										_elm_lang$core$Json_Encode$string('-1'))),
								_1: {ctor: '[]'}
							}
						}
					}),
				hasRipple ? {
					ctor: '::',
					_0: A2(_MichaelCombs28$elm_mdl$Material_Ripple$downOn_, ripple, 'mousedown'),
					_1: {
						ctor: '::',
						_0: A2(_MichaelCombs28$elm_mdl$Material_Ripple$downOn_, ripple, 'touchstart'),
						_1: {
							ctor: '::',
							_0: A2(_MichaelCombs28$elm_mdl$Material_Ripple$upOn_, ripple, 'mouseup'),
							_1: {
								ctor: '::',
								_0: A2(_MichaelCombs28$elm_mdl$Material_Ripple$upOn_, ripple, 'mouseleave'),
								_1: {
									ctor: '::',
									_0: A2(_MichaelCombs28$elm_mdl$Material_Ripple$upOn_, ripple, 'touchend'),
									_1: {
										ctor: '::',
										_0: A2(_MichaelCombs28$elm_mdl$Material_Ripple$upOn_, ripple, 'blur'),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				} : {ctor: '[]'}),
			hasRipple ? A2(
				F2(
					function (x, y) {
						return A2(_elm_lang$core$Basics_ops['++'], x, y);
					}),
				item.html,
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$map,
						ripple,
						A2(
							_MichaelCombs28$elm_mdl$Material_Ripple$view_,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mdl-menu__item-ripple-container'),
								_1: {ctor: '[]'}
							},
							A2(
								_elm_lang$core$Maybe$withDefault,
								_MichaelCombs28$elm_mdl$Material_Ripple$model,
								A2(_elm_lang$core$Dict$get, index, model.ripples)))),
					_1: {ctor: '[]'}
				}) : item.html);
	});
var _MichaelCombs28$elm_mdl$Material_Menu$BottomRight = {ctor: 'BottomRight'};
var _MichaelCombs28$elm_mdl$Material_Menu$bottomRight = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{alignment: _MichaelCombs28$elm_mdl$Material_Menu$BottomRight});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$BottomLeft = {ctor: 'BottomLeft'};
var _MichaelCombs28$elm_mdl$Material_Menu$defaultConfig = {alignment: _MichaelCombs28$elm_mdl$Material_Menu$BottomLeft, ripple: false, icon: 'more_vert'};
var _MichaelCombs28$elm_mdl$Material_Menu$bottomLeft = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{alignment: _MichaelCombs28$elm_mdl$Material_Menu$BottomLeft});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$containerGeometry = F2(
	function (alignment, geometry) {
		return _MichaelCombs28$elm_mdl$Material_Options$many(
			{
				ctor: '::',
				_0: A2(
					_MichaelCombs28$elm_mdl$Material_Options$css,
					'width',
					_MichaelCombs28$elm_mdl$Material_Menu$toPx(geometry.menu.bounds.width)),
				_1: {
					ctor: '::',
					_0: A2(
						_MichaelCombs28$elm_mdl$Material_Options$css,
						'height',
						_MichaelCombs28$elm_mdl$Material_Menu$toPx(geometry.menu.bounds.height)),
					_1: {
						ctor: '::',
						_0: (_elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$BottomRight) || _elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$BottomLeft)) ? A2(
							_MichaelCombs28$elm_mdl$Material_Options$css,
							'top',
							_MichaelCombs28$elm_mdl$Material_Menu$toPx(geometry.button.offsetTop + geometry.button.offsetHeight)) : _MichaelCombs28$elm_mdl$Material_Options$nop,
						_1: {
							ctor: '::',
							_0: function () {
								if (_elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$BottomRight) || _elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$TopRight)) {
									var right = function (e) {
										return e.bounds.left + e.bounds.width;
									};
									return A2(
										_MichaelCombs28$elm_mdl$Material_Options$css,
										'right',
										_MichaelCombs28$elm_mdl$Material_Menu$toPx(
											right(geometry.container) - right(geometry.menu)));
								} else {
									return _MichaelCombs28$elm_mdl$Material_Options$nop;
								}
							}(),
							_1: {
								ctor: '::',
								_0: function () {
									if (_elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$TopLeft) || _elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$TopRight)) {
										var bottom = geometry.container.bounds.top + geometry.container.bounds.height;
										return A2(
											_MichaelCombs28$elm_mdl$Material_Options$css,
											'bottom',
											_MichaelCombs28$elm_mdl$Material_Menu$toPx(bottom - geometry.button.bounds.top));
									} else {
										return _MichaelCombs28$elm_mdl$Material_Options$nop;
									}
								}(),
								_1: {
									ctor: '::',
									_0: (_elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$TopLeft) || _elm_lang$core$Native_Utils.eq(alignment, _MichaelCombs28$elm_mdl$Material_Menu$BottomLeft)) ? A2(
										_MichaelCombs28$elm_mdl$Material_Options$css,
										'left',
										_MichaelCombs28$elm_mdl$Material_Menu$toPx(geometry.menu.offsetLeft)) : _MichaelCombs28$elm_mdl$Material_Options$nop,
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$view = F4(
	function (lift, model, properties, items) {
		var itemSummaries = A2(
			_elm_lang$core$List$map,
			function (_p28) {
				return A2(
					_MichaelCombs28$elm_mdl$Material_Options$collect,
					_MichaelCombs28$elm_mdl$Material_Menu$defaultItemConfig,
					function (_) {
						return _.options;
					}(_p28));
			},
			items);
		var numItems = _elm_lang$core$List$length(items);
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Menu$defaultConfig, properties);
		var config = summary.config;
		var alignment = function () {
			var _p29 = config.alignment;
			switch (_p29.ctor) {
				case 'BottomLeft':
					return _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu--bottom-left');
				case 'BottomRight':
					return _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu--bottom-right');
				case 'TopLeft':
					return _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu--top-left');
				default:
					return _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu--top-right');
			}
		}();
		return A5(
			_MichaelCombs28$elm_mdl$Material_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'position', 'relative'),
				_1: properties
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$map,
					lift,
					A3(
						_MichaelCombs28$elm_mdl$Material_Options$styled,
						_elm_lang$html$Html$button,
						{
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button'),
							_1: {
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-button'),
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-button--icon'),
									_1: {
										ctor: '::',
										_0: A2(
											_MichaelCombs28$elm_mdl$Material_Options$when,
											_MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
												_MichaelCombs28$elm_mdl$Material_Menu$onKeyDown(
													_MichaelCombs28$elm_mdl$Material_Menu$Key(itemSummaries))),
											_MichaelCombs28$elm_mdl$Material_Menu$isActive(model)),
										_1: {
											ctor: '::',
											_0: A2(
												_MichaelCombs28$elm_mdl$Material_Options$when,
												_MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
													A2(_MichaelCombs28$elm_mdl$Material_Menu$onClick, _MichaelCombs28$elm_mdl$Material_Menu_Geometry$decode, _MichaelCombs28$elm_mdl$Material_Menu$Open)),
												!_elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Opened)),
											_1: {
												ctor: '::',
												_0: A2(
													_MichaelCombs28$elm_mdl$Material_Options$when,
													_MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
														_elm_lang$html$Html_Events$onClick(_MichaelCombs28$elm_mdl$Material_Menu$Close)),
													_MichaelCombs28$elm_mdl$Material_Menu$isActive(model)),
												_1: {ctor: '[]'}
											}
										}
									}
								}
							}
						},
						{
							ctor: '::',
							_0: A2(
								_MichaelCombs28$elm_mdl$Material_Icon$view,
								config.icon,
								{
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Options$cs('material-icons'),
									_1: {
										ctor: '::',
										_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'pointer-events', 'none'),
										_1: {ctor: '[]'}
									}
								}),
							_1: {ctor: '[]'}
						})),
				_1: {
					ctor: '::',
					_0: A3(
						_MichaelCombs28$elm_mdl$Material_Options$styled,
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu__container'),
							_1: {
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Options$cs('is-upgraded'),
								_1: {
									ctor: '::',
									_0: A2(
										_MichaelCombs28$elm_mdl$Material_Options$when,
										_MichaelCombs28$elm_mdl$Material_Options$cs('is-visible'),
										_elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Opened) || _elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Closing)),
									_1: {
										ctor: '::',
										_0: A2(
											_MichaelCombs28$elm_mdl$Material_Menu$withGeometry,
											model,
											_MichaelCombs28$elm_mdl$Material_Menu$containerGeometry(config.alignment)),
										_1: {ctor: '[]'}
									}
								}
							}
						},
						{
							ctor: '::',
							_0: A3(
								_MichaelCombs28$elm_mdl$Material_Options$styled,
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu__outline'),
									_1: {
										ctor: '::',
										_0: alignment,
										_1: {
											ctor: '::',
											_0: A2(
												_MichaelCombs28$elm_mdl$Material_Menu$withGeometry,
												model,
												function (geometry) {
													return _MichaelCombs28$elm_mdl$Material_Options$many(
														{
															ctor: '::',
															_0: A2(
																_MichaelCombs28$elm_mdl$Material_Options$css,
																'width',
																_MichaelCombs28$elm_mdl$Material_Menu$toPx(geometry.menu.bounds.width)),
															_1: {
																ctor: '::',
																_0: A2(
																	_MichaelCombs28$elm_mdl$Material_Options$css,
																	'height',
																	_MichaelCombs28$elm_mdl$Material_Menu$toPx(geometry.menu.bounds.height)),
																_1: {ctor: '[]'}
															}
														});
												}),
											_1: {ctor: '[]'}
										}
									}
								},
								{ctor: '[]'}),
							_1: {
								ctor: '::',
								_0: A3(
									_MichaelCombs28$elm_mdl$Material_Options$styled,
									_elm_lang$html$Html$ul,
									{
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-menu'),
										_1: {
											ctor: '::',
											_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-menu'),
											_1: {
												ctor: '::',
												_0: A2(
													_MichaelCombs28$elm_mdl$Material_Options$when,
													_MichaelCombs28$elm_mdl$Material_Options$cs('is-animating'),
													_elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Opening) || _elm_lang$core$Native_Utils.eq(model.animationState, _MichaelCombs28$elm_mdl$Material_Menu$Closing)),
												_1: {
													ctor: '::',
													_0: A2(
														_MichaelCombs28$elm_mdl$Material_Menu$withGeometry,
														model,
														A2(_MichaelCombs28$elm_mdl$Material_Menu$clip, model, config)),
													_1: {
														ctor: '::',
														_0: alignment,
														_1: {ctor: '[]'}
													}
												}
											}
										}
									},
									function () {
										var _p30 = model.geometry;
										if (_p30.ctor === 'Just') {
											var _p31 = _p30._0;
											return A6(
												_elm_lang$core$List$map5,
												A3(_MichaelCombs28$elm_mdl$Material_Menu$view1, lift, config, model),
												_p31.offsetTops,
												_p31.offsetHeights,
												A2(_elm_lang$core$List$range, 0, numItems - 1),
												itemSummaries,
												items);
										} else {
											return A4(
												_elm_lang$core$List$map3,
												A5(_MichaelCombs28$elm_mdl$Material_Menu$view1, lift, config, model, 0, 0),
												A2(_elm_lang$core$List$range, 0, numItems - 1),
												itemSummaries,
												items);
										}
									}()),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Menu$render = A5(
	_MichaelCombs28$elm_parts$Parts$create,
	_MichaelCombs28$elm_mdl$Material_Menu$view,
	_MichaelCombs28$elm_mdl$Material_Menu$update_,
	function (_) {
		return _.menu;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{menu: x});
		}),
	_MichaelCombs28$elm_mdl$Material_Menu$defaultModel);

var _MichaelCombs28$elm_mdl$Material_Snackbar$enqueue = F2(
	function (contents, model) {
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				queue: A2(
					_elm_lang$core$List$append,
					model.queue,
					{
						ctor: '::',
						_0: contents,
						_1: {ctor: '[]'}
					})
			});
	});
var _MichaelCombs28$elm_mdl$Material_Snackbar$snackbar = F3(
	function (payload, message, label) {
		return {
			message: message,
			action: _elm_lang$core$Maybe$Just(label),
			payload: payload,
			timeout: 2750,
			fade: 250
		};
	});
var _MichaelCombs28$elm_mdl$Material_Snackbar$toast = F2(
	function (payload, message) {
		return {message: message, action: _elm_lang$core$Maybe$Nothing, payload: payload, timeout: 2750, fade: 250};
	});
var _MichaelCombs28$elm_mdl$Material_Snackbar$Contents = F5(
	function (a, b, c, d, e) {
		return {message: a, action: b, payload: c, timeout: d, fade: e};
	});
var _MichaelCombs28$elm_mdl$Material_Snackbar$Model = F3(
	function (a, b, c) {
		return {queue: a, state: b, seq: c};
	});
var _MichaelCombs28$elm_mdl$Material_Snackbar$Fading = function (a) {
	return {ctor: 'Fading', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$Active = function (a) {
	return {ctor: 'Active', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$Inert = {ctor: 'Inert'};
var _MichaelCombs28$elm_mdl$Material_Snackbar$model = {
	queue: {ctor: '[]'},
	state: _MichaelCombs28$elm_mdl$Material_Snackbar$Inert,
	seq: -1
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$Clicked = {ctor: 'Clicked'};
var _MichaelCombs28$elm_mdl$Material_Snackbar$Timeout = {ctor: 'Timeout'};
var _MichaelCombs28$elm_mdl$Material_Snackbar$Move = F2(
	function (a, b) {
		return {ctor: 'Move', _0: a, _1: b};
	});
var _MichaelCombs28$elm_mdl$Material_Snackbar$next = function (model) {
	return _elm_lang$core$Platform_Cmd$map(
		_MichaelCombs28$elm_mdl$Material_Snackbar$Move(model.seq));
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$view = function (model) {
	var isActive = function () {
		var _p0 = model.state;
		switch (_p0.ctor) {
			case 'Inert':
				return false;
			case 'Active':
				return true;
			default:
				return false;
		}
	}();
	var contents = function () {
		var _p1 = model.state;
		switch (_p1.ctor) {
			case 'Inert':
				return _elm_lang$core$Maybe$Nothing;
			case 'Active':
				return _elm_lang$core$Maybe$Just(_p1._0);
			default:
				return _elm_lang$core$Maybe$Just(_p1._0);
		}
	}();
	var action = A2(
		_elm_lang$core$Maybe$andThen,
		function (_) {
			return _.action;
		},
		contents);
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$classList(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'mdl-js-snackbar', _1: true},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'mdl-snackbar', _1: true},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'mdl-snackbar--active', _1: isActive},
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {
				ctor: '::',
				_0: A2(_MichaelCombs28$elm_mdl$Material_Helpers$aria, 'hidden', !isActive),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$html$Html$div,
				{
					ctor: '::',
					_0: _elm_lang$html$Html_Attributes$class('mdl-snackbar__text'),
					_1: {ctor: '[]'}
				},
				A2(
					_elm_lang$core$Maybe$withDefault,
					{ctor: '[]'},
					A2(
						_elm_lang$core$Maybe$map,
						function (c) {
							return {
								ctor: '::',
								_0: _elm_lang$html$Html$text(c.message),
								_1: {ctor: '[]'}
							};
						},
						contents))),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$button,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('mdl-snackbar__action'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$type_('button'),
							_1: {
								ctor: '::',
								_0: A2(
									_MichaelCombs28$elm_mdl$Material_Helpers$aria,
									'hidden',
									A2(
										_elm_lang$core$Maybe$withDefault,
										true,
										A2(
											_elm_lang$core$Maybe$map,
											_elm_lang$core$Basics$always(!isActive),
											action))),
								_1: A2(
									_elm_lang$core$Maybe$withDefault,
									{ctor: '[]'},
									A2(
										_elm_lang$core$Maybe$map,
										_elm_lang$core$Basics$always(
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Events$onClick(
													A2(_MichaelCombs28$elm_mdl$Material_Snackbar$Move, model.seq, _MichaelCombs28$elm_mdl$Material_Snackbar$Clicked)),
												_1: {ctor: '[]'}
											}),
										action))
							}
						}
					},
					A2(
						_elm_lang$core$Maybe$withDefault,
						{ctor: '[]'},
						A2(
							_elm_lang$core$Maybe$map,
							function (action) {
								return {
									ctor: '::',
									_0: _elm_lang$html$Html$text(action),
									_1: {ctor: '[]'}
								};
							},
							action))),
				_1: {ctor: '[]'}
			}
		});
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$Click = function (a) {
	return {ctor: 'Click', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$End = function (a) {
	return {ctor: 'End', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$Begin = function (a) {
	return {ctor: 'Begin', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$tryDequeue = function (model) {
	var _p2 = {ctor: '_Tuple2', _0: model.state, _1: model.queue};
	if (((_p2.ctor === '_Tuple2') && (_p2._0.ctor === 'Inert')) && (_p2._1.ctor === '::')) {
		var _p3 = _p2._1._0;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{
					state: _MichaelCombs28$elm_mdl$Material_Snackbar$Active(_p3),
					queue: _p2._1._1,
					seq: model.seq + 1
				}),
			_1: _elm_lang$core$Platform_Cmd$batch(
				{
					ctor: '::',
					_0: A2(
						_elm_lang$core$Platform_Cmd$map,
						_MichaelCombs28$elm_mdl$Material_Snackbar$Move(model.seq + 1),
						A2(_MichaelCombs28$elm_mdl$Material_Helpers$delay, _p3.timeout, _MichaelCombs28$elm_mdl$Material_Snackbar$Timeout)),
					_1: {
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Helpers$cmd(
							_MichaelCombs28$elm_mdl$Material_Snackbar$Begin(_p3.payload)),
						_1: {ctor: '[]'}
					}
				})
		};
	} else {
		return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
	}
};
var _MichaelCombs28$elm_mdl$Material_Snackbar$move = F2(
	function (transition, model) {
		var _p4 = {ctor: '_Tuple2', _0: model.state, _1: transition};
		_v3_4:
		do {
			if (_p4.ctor === '_Tuple2') {
				if (_p4._1.ctor === 'Clicked') {
					if (_p4._0.ctor === 'Active') {
						var _p5 = _p4._0._0;
						return {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{
									state: _MichaelCombs28$elm_mdl$Material_Snackbar$Fading(_p5)
								}),
							_1: _elm_lang$core$Platform_Cmd$batch(
								{
									ctor: '::',
									_0: A2(
										_MichaelCombs28$elm_mdl$Material_Snackbar$next,
										model,
										A2(_MichaelCombs28$elm_mdl$Material_Helpers$delay, _p5.fade, _MichaelCombs28$elm_mdl$Material_Snackbar$Timeout)),
									_1: {
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Helpers$cmd(
											_MichaelCombs28$elm_mdl$Material_Snackbar$Click(_p5.payload)),
										_1: {ctor: '[]'}
									}
								})
						};
					} else {
						break _v3_4;
					}
				} else {
					switch (_p4._0.ctor) {
						case 'Inert':
							return _MichaelCombs28$elm_mdl$Material_Snackbar$tryDequeue(model);
						case 'Active':
							var _p6 = _p4._0._0;
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Native_Utils.update(
									model,
									{
										state: _MichaelCombs28$elm_mdl$Material_Snackbar$Fading(_p6)
									}),
								_1: _elm_lang$core$Platform_Cmd$batch(
									{
										ctor: '::',
										_0: A2(
											_MichaelCombs28$elm_mdl$Material_Snackbar$next,
											model,
											A2(_MichaelCombs28$elm_mdl$Material_Helpers$delay, _p6.fade, _MichaelCombs28$elm_mdl$Material_Snackbar$Timeout)),
										_1: {ctor: '[]'}
									})
							};
						default:
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Native_Utils.update(
									model,
									{state: _MichaelCombs28$elm_mdl$Material_Snackbar$Inert}),
								_1: _elm_lang$core$Platform_Cmd$batch(
									{
										ctor: '::',
										_0: A2(
											_MichaelCombs28$elm_mdl$Material_Snackbar$next,
											model,
											_MichaelCombs28$elm_mdl$Material_Helpers$cmd(_MichaelCombs28$elm_mdl$Material_Snackbar$Timeout)),
										_1: {
											ctor: '::',
											_0: _MichaelCombs28$elm_mdl$Material_Helpers$cmd(
												_MichaelCombs28$elm_mdl$Material_Snackbar$End(_p4._0._0.payload)),
											_1: {ctor: '[]'}
										}
									})
							};
					}
				}
			} else {
				break _v3_4;
			}
		} while(false);
		return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
	});
var _MichaelCombs28$elm_mdl$Material_Snackbar$update = F2(
	function (action, model) {
		var _p7 = action;
		if (_p7.ctor === 'Move') {
			return _elm_lang$core$Native_Utils.eq(_p7._0, model.seq) ? A2(_MichaelCombs28$elm_mdl$Material_Snackbar$move, _p7._1, model) : {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		} else {
			return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
		}
	});
var _MichaelCombs28$elm_mdl$Material_Snackbar$add = F2(
	function (contents, model) {
		return _MichaelCombs28$elm_mdl$Material_Snackbar$tryDequeue(
			A2(_MichaelCombs28$elm_mdl$Material_Snackbar$enqueue, contents, model));
	});

var _elm_lang$html$Html_Keyed$node = _elm_lang$virtual_dom$VirtualDom$keyedNode;
var _elm_lang$html$Html_Keyed$ol = _elm_lang$html$Html_Keyed$node('ol');
var _elm_lang$html$Html_Keyed$ul = _elm_lang$html$Html_Keyed$node('ul');

var _elm_lang$window$Native_Window = function()
{

var size = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)	{
	callback(_elm_lang$core$Native_Scheduler.succeed({
		width: window.innerWidth,
		height: window.innerHeight
	}));
});

return {
	size: size
};

}();
var _elm_lang$window$Window_ops = _elm_lang$window$Window_ops || {};
_elm_lang$window$Window_ops['&>'] = F2(
	function (task1, task2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return task2;
			},
			task1);
	});
var _elm_lang$window$Window$onSelfMsg = F3(
	function (router, dimensions, state) {
		var _p1 = state;
		if (_p1.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var send = function (_p2) {
				var _p3 = _p2;
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					_p3._0(dimensions));
			};
			return A2(
				_elm_lang$window$Window_ops['&>'],
				_elm_lang$core$Task$sequence(
					A2(_elm_lang$core$List$map, send, _p1._0.subs)),
				_elm_lang$core$Task$succeed(state));
		}
	});
var _elm_lang$window$Window$init = _elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing);
var _elm_lang$window$Window$size = _elm_lang$window$Native_Window.size;
var _elm_lang$window$Window$width = A2(
	_elm_lang$core$Task$map,
	function (_) {
		return _.width;
	},
	_elm_lang$window$Window$size);
var _elm_lang$window$Window$height = A2(
	_elm_lang$core$Task$map,
	function (_) {
		return _.height;
	},
	_elm_lang$window$Window$size);
var _elm_lang$window$Window$onEffects = F3(
	function (router, newSubs, oldState) {
		var _p4 = {ctor: '_Tuple2', _0: oldState, _1: newSubs};
		if (_p4._0.ctor === 'Nothing') {
			if (_p4._1.ctor === '[]') {
				return _elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing);
			} else {
				return A2(
					_elm_lang$core$Task$andThen,
					function (pid) {
						return _elm_lang$core$Task$succeed(
							_elm_lang$core$Maybe$Just(
								{subs: newSubs, pid: pid}));
					},
					_elm_lang$core$Process$spawn(
						A3(
							_elm_lang$dom$Dom_LowLevel$onWindow,
							'resize',
							_elm_lang$core$Json_Decode$succeed(
								{ctor: '_Tuple0'}),
							function (_p5) {
								return A2(
									_elm_lang$core$Task$andThen,
									_elm_lang$core$Platform$sendToSelf(router),
									_elm_lang$window$Window$size);
							})));
			}
		} else {
			if (_p4._1.ctor === '[]') {
				return A2(
					_elm_lang$window$Window_ops['&>'],
					_elm_lang$core$Process$kill(_p4._0._0.pid),
					_elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing));
			} else {
				return _elm_lang$core$Task$succeed(
					_elm_lang$core$Maybe$Just(
						{subs: newSubs, pid: _p4._0._0.pid}));
			}
		}
	});
var _elm_lang$window$Window$subscription = _elm_lang$core$Native_Platform.leaf('Window');
var _elm_lang$window$Window$Size = F2(
	function (a, b) {
		return {width: a, height: b};
	});
var _elm_lang$window$Window$MySub = function (a) {
	return {ctor: 'MySub', _0: a};
};
var _elm_lang$window$Window$resizes = function (tagger) {
	return _elm_lang$window$Window$subscription(
		_elm_lang$window$Window$MySub(tagger));
};
var _elm_lang$window$Window$subMap = F2(
	function (func, _p6) {
		var _p7 = _p6;
		return _elm_lang$window$Window$MySub(
			function (_p8) {
				return func(
					_p7._0(_p8));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Window'] = {pkg: 'elm-lang/window', init: _elm_lang$window$Window$init, onEffects: _elm_lang$window$Window$onEffects, onSelfMsg: _elm_lang$window$Window$onSelfMsg, tag: 'sub', subMap: _elm_lang$window$Window$subMap};

var _MichaelCombs28$elm_mdl$Material_Layout$drawerView = F3(
	function (lift, isVisible, elems) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'mdl-layout__drawer', _1: true},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'is-visible', _1: isVisible},
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html_Attributes$attribute,
						'aria-hidden',
						isVisible ? 'false' : 'true'),
					_1: {ctor: '[]'}
				}
			},
			elems);
	});
var _MichaelCombs28$elm_mdl$Material_Layout$onKeypressFilterSpaceAndEnter = A2(_elm_lang$html$Html_Attributes$attribute, 'onkeypress', '\n  (function (evt) {\n     if (evt && evt.type === \"keydown\" && (evt.keyCode === 32 || evt.keyCode === 13)) {\n       evt.preventDefault();\n     }\n   })(window.event);\n  ');
var _MichaelCombs28$elm_mdl$Material_Layout$toList = function (x) {
	var _p0 = x;
	if (_p0.ctor === 'Nothing') {
		return {ctor: '[]'};
	} else {
		return {
			ctor: '::',
			_0: _p0._0,
			_1: {ctor: '[]'}
		};
	}
};
var _MichaelCombs28$elm_mdl$Material_Layout$isWaterfall = function (mode) {
	var _p1 = mode;
	if (_p1.ctor === 'Waterfall') {
		return true;
	} else {
		return false;
	}
};
var _MichaelCombs28$elm_mdl$Material_Layout$row = function (styles) {
	return _MichaelCombs28$elm_mdl$Material_Options$div(
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__header-row'),
			_1: styles
		});
};
var _MichaelCombs28$elm_mdl$Material_Layout$link = F2(
	function (styles, contents) {
		return A3(
			_MichaelCombs28$elm_mdl$Material_Options$styled,
			_elm_lang$html$Html$a,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-navigation__link'),
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
						A2(_elm_lang$html$Html_Attributes$attribute, 'tabindex', '1')),
					_1: styles
				}
			},
			contents);
	});
var _MichaelCombs28$elm_mdl$Material_Layout$href = function (_p2) {
	return _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
		_elm_lang$html$Html_Attributes$href(_p2));
};
var _MichaelCombs28$elm_mdl$Material_Layout$onClick = function (_p3) {
	return _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
		_elm_lang$html$Html_Events$onClick(_p3));
};
var _MichaelCombs28$elm_mdl$Material_Layout$navigation = F2(
	function (styles, contents) {
		return A3(
			_MichaelCombs28$elm_mdl$Material_Options$styled,
			_elm_lang$html$Html$nav,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-navigation'),
				_1: styles
			},
			contents);
	});
var _MichaelCombs28$elm_mdl$Material_Layout$title = function (styles) {
	return _MichaelCombs28$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__title'),
			_1: styles
		});
};
var _MichaelCombs28$elm_mdl$Material_Layout$spacer = A2(
	_elm_lang$html$Html$div,
	{
		ctor: '::',
		_0: _elm_lang$html$Html_Attributes$class('mdl-layout-spacer'),
		_1: {ctor: '[]'}
	},
	{ctor: '[]'});
var _MichaelCombs28$elm_mdl$Material_Layout$onSelectTab = function (f) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					onSelectTab: _elm_lang$core$Maybe$Just(
						function (_p4) {
							return _elm_lang$html$Html_Events$onClick(
								f(_p4));
						})
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Layout$moreTabs = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{moreTabs: true});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$selectedTab = function (k) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{selectedTab: k});
		});
};
var _MichaelCombs28$elm_mdl$Material_Layout$transparentHeader = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{transparentHeader: true});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$rippleTabs = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{rippleTabs: true});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$fixedTabs = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{fixedTabs: true});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$fixedDrawer = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{fixedDrawer: true});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$fixedHeader = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{fixedHeader: true});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$setTabsWidth_ = F2(
	function (width, model) {
		var x = model.tabScrollState;
		return _elm_lang$core$Native_Utils.update(
			model,
			{
				tabScrollState: _elm_lang$core$Native_Utils.update(
					x,
					{
						width: _elm_lang$core$Maybe$Just(width)
					})
			});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$setTabsWidth = F2(
	function (w, container) {
		return _elm_lang$core$Native_Utils.update(
			container,
			{
				layout: A2(_MichaelCombs28$elm_mdl$Material_Layout$setTabsWidth_, w, container.layout)
			});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$defaultTabScrollState = {canScrollRight: true, canScrollLeft: false, width: _elm_lang$core$Maybe$Nothing};
var _MichaelCombs28$elm_mdl$Material_Layout$defaultModel = {ripples: _elm_lang$core$Dict$empty, isSmallScreen: false, isCompact: false, isAnimating: false, isScrolled: false, isDrawerOpen: false, tabScrollState: _MichaelCombs28$elm_mdl$Material_Layout$defaultTabScrollState};
var _MichaelCombs28$elm_mdl$Material_Layout$TabScrollState = F3(
	function (a, b, c) {
		return {canScrollLeft: a, canScrollRight: b, width: c};
	});
var _MichaelCombs28$elm_mdl$Material_Layout$Model = F7(
	function (a, b, c, d, e, f, g) {
		return {ripples: a, isSmallScreen: b, isCompact: c, isAnimating: d, isScrolled: e, isDrawerOpen: f, tabScrollState: g};
	});
var _MichaelCombs28$elm_mdl$Material_Layout$Config = F9(
	function (a, b, c, d, e, f, g, h, i) {
		return {fixedHeader: a, fixedDrawer: b, fixedTabs: c, rippleTabs: d, mode: e, selectedTab: f, onSelectTab: g, transparentHeader: h, moreTabs: i};
	});
var _MichaelCombs28$elm_mdl$Material_Layout$Contents = F4(
	function (a, b, c, d) {
		return {header: a, drawer: b, tabs: c, main: d};
	});
var _MichaelCombs28$elm_mdl$Material_Layout$Ripple = F2(
	function (a, b) {
		return {ctor: 'Ripple', _0: a, _1: b};
	});
var _MichaelCombs28$elm_mdl$Material_Layout$NOP = {ctor: 'NOP'};
var _MichaelCombs28$elm_mdl$Material_Layout$TransitionEnd = {ctor: 'TransitionEnd'};
var _MichaelCombs28$elm_mdl$Material_Layout$TransitionHeader = function (a) {
	return {ctor: 'TransitionHeader', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Layout$update_ = F3(
	function (f, action, model) {
		update_:
		while (true) {
			var _p5 = action;
			switch (_p5.ctor) {
				case 'NOP':
					return _elm_lang$core$Maybe$Nothing;
				case 'Resize':
					var _p6 = _p5._0;
					var tabScrollState = A2(
						_elm_lang$core$Maybe$withDefault,
						model.tabScrollState,
						A2(
							_elm_lang$core$Maybe$map,
							function (tabsWidth) {
								var tabScrollState = model.tabScrollState;
								return _elm_lang$core$Native_Utils.update(
									tabScrollState,
									{
										canScrollRight: _elm_lang$core$Native_Utils.cmp(tabsWidth + (2 * 56), _p6) > 0
									});
							},
							model.tabScrollState.width));
					var isSmall = _elm_lang$core$Native_Utils.cmp(1024, _p6) > 0;
					return (_elm_lang$core$Native_Utils.eq(isSmall, model.isSmallScreen) && _elm_lang$core$Native_Utils.eq(tabScrollState.canScrollRight, model.tabScrollState.canScrollRight)) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
						_MichaelCombs28$elm_mdl$Material_Helpers$pure(
							_elm_lang$core$Native_Utils.update(
								model,
								{isSmallScreen: isSmall, isDrawerOpen: (!isSmall) && model.isDrawerOpen, tabScrollState: tabScrollState})));
				case 'ToggleDrawer':
					return _elm_lang$core$Maybe$Just(
						_MichaelCombs28$elm_mdl$Material_Helpers$pure(
							_elm_lang$core$Native_Utils.update(
								model,
								{isDrawerOpen: !model.isDrawerOpen})));
				case 'Ripple':
					var _p8 = _p5._0;
					return _elm_lang$core$Maybe$Just(
						A2(
							_MichaelCombs28$elm_mdl$Material_Helpers$map2nd,
							_elm_lang$core$Platform_Cmd$map(
								function (_p7) {
									return f(
										A2(_MichaelCombs28$elm_mdl$Material_Layout$Ripple, _p8, _p7));
								}),
							A2(
								_MichaelCombs28$elm_mdl$Material_Helpers$map1st,
								function (ripple_) {
									return _elm_lang$core$Native_Utils.update(
										model,
										{
											ripples: A3(_elm_lang$core$Dict$insert, _p8, ripple_, model.ripples)
										});
								},
								A2(
									_MichaelCombs28$elm_mdl$Material_Ripple$update,
									_p5._1,
									A2(
										_elm_lang$core$Maybe$withDefault,
										_MichaelCombs28$elm_mdl$Material_Ripple$model,
										A2(_elm_lang$core$Dict$get, _p8, model.ripples))))));
				case 'ScrollTab':
					var _p9 = _p5._0;
					return (!_elm_lang$core$Native_Utils.eq(model.tabScrollState, _p9)) ? _elm_lang$core$Maybe$Just(
						_MichaelCombs28$elm_mdl$Material_Helpers$pure(
							_elm_lang$core$Native_Utils.update(
								model,
								{tabScrollState: _p9}))) : _elm_lang$core$Maybe$Nothing;
				case 'ScrollPane':
					var isScrolled = _elm_lang$core$Native_Utils.cmp(0.0, _p5._1) < 0;
					if (!_elm_lang$core$Native_Utils.eq(isScrolled, model.isScrolled)) {
						var _v3 = f,
							_v4 = _MichaelCombs28$elm_mdl$Material_Layout$TransitionHeader(
							{toCompact: isScrolled, fixedHeader: _p5._0}),
							_v5 = _elm_lang$core$Native_Utils.update(
							model,
							{isScrolled: isScrolled});
						f = _v3;
						action = _v4;
						model = _v5;
						continue update_;
					} else {
						return _elm_lang$core$Maybe$Nothing;
					}
				case 'TransitionHeader':
					return (!model.isAnimating) ? _elm_lang$core$Maybe$Just(
						{
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.update(
								model,
								{isCompact: _p5._0.toCompact, isAnimating: (!model.isSmallScreen) || _p5._0.fixedHeader}),
							_1: _elm_lang$core$Platform_Cmd$none
						}) : _elm_lang$core$Maybe$Nothing;
				default:
					return _elm_lang$core$Maybe$Just(
						_MichaelCombs28$elm_mdl$Material_Helpers$pure(
							_elm_lang$core$Native_Utils.update(
								model,
								{isAnimating: false})));
			}
		}
	});
var _MichaelCombs28$elm_mdl$Material_Layout$update = F2(
	function (msg, model) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			{ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none},
			A3(_MichaelCombs28$elm_mdl$Material_Layout$update_, _elm_lang$core$Basics$identity, msg, model));
	});
var _MichaelCombs28$elm_mdl$Material_Layout$pack = function (fwd) {
	return A4(
		_MichaelCombs28$elm_parts$Parts$pack1,
		F3(
			function (x, y, z) {
				return _MichaelCombs28$elm_mdl$Material_Helpers$partsUpdatePort(
					A3(_MichaelCombs28$elm_mdl$Material_Layout$update_, x, y, z));
			}),
		function (_) {
			return _.layout;
		},
		F2(
			function (x, c) {
				return _elm_lang$core$Native_Utils.update(
					c,
					{layout: x});
			}),
		fwd);
};
var _MichaelCombs28$elm_mdl$Material_Layout$ScrollPane = F2(
	function (a, b) {
		return {ctor: 'ScrollPane', _0: a, _1: b};
	});
var _MichaelCombs28$elm_mdl$Material_Layout$ScrollTab = function (a) {
	return {ctor: 'ScrollTab', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Layout$Resize = function (a) {
	return {ctor: 'Resize', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Layout$init = function () {
	var result_ = function (result) {
		var _p10 = result;
		if (_p10.ctor === 'Ok') {
			return _MichaelCombs28$elm_mdl$Material_Layout$Resize(_p10._0);
		} else {
			return _MichaelCombs28$elm_mdl$Material_Layout$Resize(
				A2(_elm_lang$core$Debug$log, 'Can\'t get initial window dimensions. Guessing ', 1025));
		}
	};
	var measureScreenSize = A2(_elm_lang$core$Task$attempt, result_, _elm_lang$window$Window$width);
	return {ctor: '_Tuple2', _0: _MichaelCombs28$elm_mdl$Material_Layout$defaultModel, _1: measureScreenSize};
}();
var _MichaelCombs28$elm_mdl$Material_Layout$sub0 = function (lift) {
	return A2(
		_elm_lang$core$Platform_Cmd$map,
		_MichaelCombs28$elm_mdl$Material_Layout$pack(lift),
		_elm_lang$core$Tuple$second(_MichaelCombs28$elm_mdl$Material_Layout$init));
};
var _MichaelCombs28$elm_mdl$Material_Layout$subscriptions = function (model) {
	return _elm_lang$window$Window$resizes(
		function (_p11) {
			return _MichaelCombs28$elm_mdl$Material_Layout$Resize(
				function (_) {
					return _.width;
				}(_p11));
		});
};
var _MichaelCombs28$elm_mdl$Material_Layout$subs = function (lift) {
	return function (_p12) {
		return A2(
			_elm_lang$core$Platform_Sub$map,
			_MichaelCombs28$elm_mdl$Material_Layout$pack(lift),
			_MichaelCombs28$elm_mdl$Material_Layout$subscriptions(
				function (_) {
					return _.layout;
				}(_p12)));
	};
};
var _MichaelCombs28$elm_mdl$Material_Layout$ToggleDrawer = {ctor: 'ToggleDrawer'};
var _MichaelCombs28$elm_mdl$Material_Layout$drawerButton = F2(
	function (lift, isVisible) {
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$classList(
							{
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'mdl-layout__drawer-button', _1: true},
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html_Attributes$attribute,
								'aria-expanded',
								isVisible ? 'true' : 'false'),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$tabindex(1),
								_1: {
									ctor: '::',
									_0: _elm_lang$html$Html_Events$onClick(
										lift(_MichaelCombs28$elm_mdl$Material_Layout$ToggleDrawer)),
									_1: {
										ctor: '::',
										_0: A3(
											_elm_lang$html$Html_Events$onWithOptions,
											'keydown',
											{stopPropagation: false, preventDefault: false},
											A2(
												_elm_lang$core$Json_Decode$map,
												function (_p13) {
													return lift(
														function (key) {
															var _p14 = key;
															switch (_p14) {
																case 32:
																	return _MichaelCombs28$elm_mdl$Material_Layout$ToggleDrawer;
																case 13:
																	return _MichaelCombs28$elm_mdl$Material_Layout$ToggleDrawer;
																default:
																	return _MichaelCombs28$elm_mdl$Material_Layout$NOP;
															}
														}(_p13));
												},
												_elm_lang$html$Html_Events$keyCode)),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					},
					{
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Icon$i('menu'),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$obfuscator = F2(
	function (lift, isVisible) {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'mdl-layout__obfuscator', _1: true},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'is-visible', _1: isVisible},
							_1: {ctor: '[]'}
						}
					}),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onClick(
						lift(_MichaelCombs28$elm_mdl$Material_Layout$ToggleDrawer)),
					_1: {ctor: '[]'}
				}
			},
			{ctor: '[]'});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$toggleDrawer = function (lift) {
	return A2(_MichaelCombs28$elm_mdl$Material_Layout$pack, lift, _MichaelCombs28$elm_mdl$Material_Layout$ToggleDrawer);
};
var _MichaelCombs28$elm_mdl$Material_Layout$LinkProp = {ctor: 'LinkProp'};
var _MichaelCombs28$elm_mdl$Material_Layout$Waterfall = function (a) {
	return {ctor: 'Waterfall', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Layout$waterfall = function (b) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					mode: _MichaelCombs28$elm_mdl$Material_Layout$Waterfall(b)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Layout$Scrolling = {ctor: 'Scrolling'};
var _MichaelCombs28$elm_mdl$Material_Layout$scrolling = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{mode: _MichaelCombs28$elm_mdl$Material_Layout$Scrolling});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$Seamed = {ctor: 'Seamed'};
var _MichaelCombs28$elm_mdl$Material_Layout$seamed = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (config) {
		return _elm_lang$core$Native_Utils.update(
			config,
			{mode: _MichaelCombs28$elm_mdl$Material_Layout$Seamed});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$Standard = {ctor: 'Standard'};
var _MichaelCombs28$elm_mdl$Material_Layout$defaultConfig = {fixedHeader: false, fixedDrawer: false, fixedTabs: false, rippleTabs: true, mode: _MichaelCombs28$elm_mdl$Material_Layout$Standard, onSelectTab: _elm_lang$core$Maybe$Nothing, selectedTab: -1, moreTabs: false, transparentHeader: false};
var _MichaelCombs28$elm_mdl$Material_Layout$headerView = F4(
	function (lift, config, model, _p15) {
		var _p16 = _p15;
		var mode = function () {
			var _p17 = config.mode;
			switch (_p17.ctor) {
				case 'Standard':
					return _MichaelCombs28$elm_mdl$Material_Options$nop;
				case 'Scrolling':
					return _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__header--scroll');
				case 'Seamed':
					return _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__header--seamed');
				default:
					if (_p17._0 === true) {
						return _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__header--waterfall mdl-layout__header--waterfall-hide-top');
					} else {
						return _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__header--waterfall');
					}
			}
		}();
		return A3(
			_MichaelCombs28$elm_mdl$Material_Options$styled,
			_elm_lang$html$Html$header,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__header'),
				_1: {
					ctor: '::',
					_0: A2(
						_MichaelCombs28$elm_mdl$Material_Options$when,
						_MichaelCombs28$elm_mdl$Material_Options$cs('is-casting-shadow'),
						_elm_lang$core$Native_Utils.eq(config.mode, _MichaelCombs28$elm_mdl$Material_Layout$Standard) || (_MichaelCombs28$elm_mdl$Material_Layout$isWaterfall(config.mode) && model.isCompact)),
					_1: {
						ctor: '::',
						_0: A2(
							_MichaelCombs28$elm_mdl$Material_Options$when,
							_MichaelCombs28$elm_mdl$Material_Options$cs('is-animating'),
							model.isAnimating),
						_1: {
							ctor: '::',
							_0: A2(
								_MichaelCombs28$elm_mdl$Material_Options$when,
								_MichaelCombs28$elm_mdl$Material_Options$cs('is-compact'),
								model.isCompact),
							_1: {
								ctor: '::',
								_0: mode,
								_1: {
									ctor: '::',
									_0: A2(
										_MichaelCombs28$elm_mdl$Material_Options$when,
										_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__header--transparent'),
										config.transparentHeader),
									_1: {
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
											_elm_lang$html$Html_Events$onClick(
												lift(
													_MichaelCombs28$elm_mdl$Material_Layout$TransitionHeader(
														{toCompact: false, fixedHeader: config.fixedHeader})))),
										_1: {
											ctor: '::',
											_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
												A2(
													_elm_lang$html$Html_Events$on,
													'transitionend',
													_elm_lang$core$Json_Decode$succeed(
														lift(_MichaelCombs28$elm_mdl$Material_Layout$TransitionEnd)))),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}
					}
				}
			},
			A2(
				_elm_lang$core$List$concatMap,
				function (x) {
					return x;
				},
				{
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Layout$toList(_p16._0),
					_1: {
						ctor: '::',
						_0: _p16._1,
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Layout$toList(_p16._2),
							_1: {ctor: '[]'}
						}
					}
				}));
	});
var _MichaelCombs28$elm_mdl$Material_Layout$Right = {ctor: 'Right'};
var _MichaelCombs28$elm_mdl$Material_Layout$Left = {ctor: 'Left'};
var _MichaelCombs28$elm_mdl$Material_Layout$tabsView = F4(
	function (lift, config, model, _p18) {
		var _p19 = _p18;
		var _p22 = _p19._1;
		var chevron = F2(
			function (direction, offset) {
				var dir = function () {
					var _p20 = direction;
					if (_p20.ctor === 'Left') {
						return 'left';
					} else {
						return 'right';
					}
				}();
				return A3(
					_MichaelCombs28$elm_mdl$Material_Options$styled,
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__tab-bar-button'),
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$cs(
								A2(
									_elm_lang$core$Basics_ops['++'],
									'mdl-layout__tab-bar-',
									A2(_elm_lang$core$Basics_ops['++'], dir, '-button'))),
							_1: {
								ctor: '::',
								_0: A2(
									_MichaelCombs28$elm_mdl$Material_Options$when,
									_MichaelCombs28$elm_mdl$Material_Options$cs('is-active'),
									(_elm_lang$core$Native_Utils.eq(direction, _MichaelCombs28$elm_mdl$Material_Layout$Left) && model.tabScrollState.canScrollLeft) || (_elm_lang$core$Native_Utils.eq(direction, _MichaelCombs28$elm_mdl$Material_Layout$Right) && model.tabScrollState.canScrollRight)),
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Options$many(_p22),
									_1: {ctor: '[]'}
								}
							}
						}
					},
					{
						ctor: '::',
						_0: A2(
							_MichaelCombs28$elm_mdl$Material_Icon$view,
							A2(_elm_lang$core$Basics_ops['++'], 'chevron_', dir),
							{
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Icon$size24,
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
										A2(
											_elm_lang$html$Html_Attributes$attribute,
											'onclick',
											A2(
												_elm_lang$core$Basics_ops['++'],
												'document.getElementsByClassName(\'mdl-layout__tab-bar\')[0].scrollLeft += ',
												_elm_lang$core$Basics$toString(offset)))),
									_1: {ctor: '[]'}
								}
							}),
						_1: {ctor: '[]'}
					});
			});
		return A2(
			_MichaelCombs28$elm_mdl$Material_Options$div,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__tab-bar-container'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(chevron, _MichaelCombs28$elm_mdl$Material_Layout$Left, -100),
				_1: {
					ctor: '::',
					_0: A2(
						_MichaelCombs28$elm_mdl$Material_Options$div,
						{
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__tab-bar'),
							_1: {
								ctor: '::',
								_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'position', 'relative'),
								_1: {
									ctor: '::',
									_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'scroll-behavior', 'smooth'),
									_1: {
										ctor: '::',
										_0: config.rippleTabs ? _MichaelCombs28$elm_mdl$Material_Options$many(
											{
												ctor: '::',
												_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-ripple-effect'),
												_1: {
													ctor: '::',
													_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mds-js-ripple-effect--ignore-events'),
													_1: {ctor: '[]'}
												}
											}) : _MichaelCombs28$elm_mdl$Material_Options$nop,
										_1: {
											ctor: '::',
											_0: _elm_lang$core$Native_Utils.eq(config.mode, _MichaelCombs28$elm_mdl$Material_Layout$Standard) ? _MichaelCombs28$elm_mdl$Material_Options$cs('is-casting-shadow') : _MichaelCombs28$elm_mdl$Material_Options$nop,
											_1: {
												ctor: '::',
												_0: _MichaelCombs28$elm_mdl$Material_Options$many(_p22),
												_1: {
													ctor: '::',
													_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
														A2(
															_elm_lang$html$Html_Events$on,
															'scroll',
															_MichaelCombs28$elm_dom$DOM$target(
																A4(
																	_elm_lang$core$Json_Decode$map3,
																	F3(
																		function (scrollWidth, clientWidth, scrollLeft) {
																			return lift(
																				_MichaelCombs28$elm_mdl$Material_Layout$ScrollTab(
																					{
																						canScrollLeft: _elm_lang$core$Native_Utils.cmp(scrollLeft, 0) > 0,
																						canScrollRight: _elm_lang$core$Native_Utils.cmp(scrollWidth - clientWidth, scrollLeft + 1) > 0,
																						width: _elm_lang$core$Maybe$Just(scrollWidth)
																					}));
																		}),
																	A2(_elm_lang$core$Json_Decode$field, 'scrollWidth', _elm_lang$core$Json_Decode$float),
																	A2(_elm_lang$core$Json_Decode$field, 'clientWidth', _elm_lang$core$Json_Decode$float),
																	A2(_elm_lang$core$Json_Decode$field, 'scrollLeft', _elm_lang$core$Json_Decode$float))))),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						},
						A2(
							_elm_lang$core$List$indexedMap,
							F2(
								function (tabIndex, tab) {
									return A3(
										_MichaelCombs28$elm_mdl$Material_Helpers$filter,
										_elm_lang$html$Html$a,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$classList(
												{
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'mdl-layout__tab', _1: true},
													_1: {
														ctor: '::',
														_0: {
															ctor: '_Tuple2',
															_0: 'is-active',
															_1: _elm_lang$core$Native_Utils.eq(tabIndex, config.selectedTab)
														},
														_1: {ctor: '[]'}
													}
												}),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$core$Maybe$withDefault,
													_MichaelCombs28$elm_mdl$Material_Helpers$noAttr,
													A2(
														_elm_lang$core$Maybe$map,
														F2(
															function (x, y) {
																return y(x);
															})(tabIndex),
														config.onSelectTab)),
												_1: {ctor: '[]'}
											}
										},
										{
											ctor: '::',
											_0: _elm_lang$core$Maybe$Just(tab),
											_1: {
												ctor: '::',
												_0: config.rippleTabs ? _elm_lang$core$Maybe$Just(
													A2(
														_elm_lang$html$Html$map,
														function (_p21) {
															return lift(
																A2(_MichaelCombs28$elm_mdl$Material_Layout$Ripple, tabIndex, _p21));
														},
														A2(
															_MichaelCombs28$elm_mdl$Material_Ripple$view,
															{
																ctor: '::',
																_0: _elm_lang$html$Html_Attributes$class('mdl-layout__tab-ripple-container'),
																_1: {ctor: '[]'}
															},
															A2(
																_elm_lang$core$Maybe$withDefault,
																_MichaelCombs28$elm_mdl$Material_Ripple$model,
																A2(_elm_lang$core$Dict$get, tabIndex, model.ripples))))) : _elm_lang$core$Maybe$Nothing,
												_1: {ctor: '[]'}
											}
										});
								}),
							_p19._0)),
					_1: {
						ctor: '::',
						_0: A2(chevron, _MichaelCombs28$elm_mdl$Material_Layout$Right, 100),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$view = F4(
	function (lift, model, options, _p23) {
		var _p24 = _p23;
		var _p32 = _p24.tabs;
		var _p31 = _p24.header;
		var _p30 = _p24.drawer;
		var hasDrawer = !_elm_lang$core$Native_Utils.eq(
			_p30,
			{ctor: '[]'});
		var hasTabs = !_elm_lang$core$List$isEmpty(
			_elm_lang$core$Tuple$first(_p32));
		var hasHeader = hasTabs || (!_elm_lang$core$List$isEmpty(_p31));
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Layout$defaultConfig, options);
		var config = summary.config;
		var drawerIsFixed = config.fixedDrawer && (!model.isSmallScreen);
		var drawerIsVisible = model.isDrawerOpen && (!drawerIsFixed);
		var _p25 = function () {
			var _p26 = {ctor: '_Tuple3', _0: _p30, _1: _p31, _2: config.fixedHeader};
			if ((_p26.ctor === '_Tuple3') && (_p26._0.ctor === '::')) {
				if ((_p26._1.ctor === '::') && (_p26._2 === true)) {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Nothing,
						_1: _elm_lang$core$Maybe$Just(
							A2(_MichaelCombs28$elm_mdl$Material_Layout$drawerButton, lift, drawerIsVisible))
					};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(
							A2(_MichaelCombs28$elm_mdl$Material_Layout$drawerButton, lift, drawerIsVisible)),
						_1: _elm_lang$core$Maybe$Nothing
					};
				}
			} else {
				return {ctor: '_Tuple2', _0: _elm_lang$core$Maybe$Nothing, _1: _elm_lang$core$Maybe$Nothing};
			}
		}();
		var contentDrawerButton = _p25._0;
		var headerDrawerButton = _p25._1;
		var tabsElems = (!hasTabs) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
			A4(_MichaelCombs28$elm_mdl$Material_Layout$tabsView, lift, config, model, _p32));
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'mdl-layout__container', _1: true},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: 'has-scrolling-header',
								_1: _elm_lang$core$Native_Utils.eq(config.mode, _MichaelCombs28$elm_mdl$Material_Layout$Scrolling)
							},
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A3(
					_MichaelCombs28$elm_mdl$Material_Helpers$filter,
					_elm_lang$html$Html_Keyed$node('div'),
					A2(
						_elm_lang$core$List$filterMap,
						_elm_lang$core$Basics$identity,
						{
							ctor: '::',
							_0: _elm_lang$core$Maybe$Just(
								_elm_lang$html$Html_Attributes$classList(
									{
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: 'mdl-layout ', _1: true},
										_1: {
											ctor: '::',
											_0: {ctor: '_Tuple2', _0: 'is-upgraded', _1: true},
											_1: {
												ctor: '::',
												_0: {ctor: '_Tuple2', _0: 'is-small-screen', _1: model.isSmallScreen},
												_1: {
													ctor: '::',
													_0: {ctor: '_Tuple2', _0: 'has-drawer', _1: hasDrawer},
													_1: {
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'has-tabs', _1: hasTabs},
														_1: {
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: 'mdl-js-layout', _1: true},
															_1: {
																ctor: '::',
																_0: {ctor: '_Tuple2', _0: 'mdl-layout--fixed-drawer', _1: config.fixedDrawer && hasDrawer},
																_1: {
																	ctor: '::',
																	_0: {ctor: '_Tuple2', _0: 'mdl-layout--fixed-header', _1: config.fixedHeader && hasHeader},
																	_1: {
																		ctor: '::',
																		_0: {ctor: '_Tuple2', _0: 'mdl-layout--fixed-tabs', _1: config.fixedTabs && hasTabs},
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													}
												}
											}
										}
									})),
							_1: {
								ctor: '::',
								_0: drawerIsVisible ? _elm_lang$core$Maybe$Just(
									A2(
										_elm_lang$html$Html_Events$on,
										'keydown',
										A2(
											_elm_lang$core$Json_Decode$map,
											function (_p27) {
												return lift(
													function (key) {
														return _elm_lang$core$Native_Utils.eq(key, 27) ? _MichaelCombs28$elm_mdl$Material_Layout$ToggleDrawer : _MichaelCombs28$elm_mdl$Material_Layout$NOP;
													}(_p27));
											},
											_elm_lang$html$Html_Events$keyCode))) : _elm_lang$core$Maybe$Nothing,
								_1: {ctor: '[]'}
							}
						}),
					{
						ctor: '::',
						_0: hasHeader ? _elm_lang$core$Maybe$Just(
							A2(
								F2(
									function (v0, v1) {
										return {ctor: '_Tuple2', _0: v0, _1: v1};
									}),
								'elm-mdl-header',
								A4(
									_MichaelCombs28$elm_mdl$Material_Layout$headerView,
									lift,
									config,
									model,
									{ctor: '_Tuple3', _0: headerDrawerButton, _1: _p31, _2: tabsElems}))) : _elm_lang$core$Maybe$Nothing,
						_1: {
							ctor: '::',
							_0: (!hasDrawer) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
								{
									ctor: '_Tuple2',
									_0: 'elm-mdl-drawer',
									_1: A3(_MichaelCombs28$elm_mdl$Material_Layout$drawerView, lift, drawerIsVisible, _p30)
								}),
							_1: {
								ctor: '::',
								_0: (!hasDrawer) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
									{
										ctor: '_Tuple2',
										_0: 'elm-mdl-obfuscator',
										_1: A2(_MichaelCombs28$elm_mdl$Material_Layout$obfuscator, lift, drawerIsVisible)
									}),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$core$Maybe$map,
										F2(
											function (v0, v1) {
												return {ctor: '_Tuple2', _0: v0, _1: v1};
											})('elm-drawer-button'),
										contentDrawerButton),
									_1: {
										ctor: '::',
										_0: _elm_lang$core$Maybe$Just(
											A2(
												F2(
													function (v0, v1) {
														return {ctor: '_Tuple2', _0: v0, _1: v1};
													}),
												_elm_lang$core$Basics$toString(config.selectedTab),
												A3(
													_MichaelCombs28$elm_mdl$Material_Options$styled,
													_elm_lang$html$Html$main_,
													{
														ctor: '::',
														_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-layout__content'),
														_1: {
															ctor: '::',
															_0: A2(
																_MichaelCombs28$elm_mdl$Material_Options$when,
																A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'overflow-y', 'visible'),
																_elm_lang$core$Native_Utils.eq(config.mode, _MichaelCombs28$elm_mdl$Material_Layout$Scrolling) && config.fixedHeader),
															_1: {
																ctor: '::',
																_0: A2(
																	_MichaelCombs28$elm_mdl$Material_Options$when,
																	A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'overflow-x', 'visible'),
																	_elm_lang$core$Native_Utils.eq(config.mode, _MichaelCombs28$elm_mdl$Material_Layout$Scrolling) && config.fixedHeader),
																_1: {
																	ctor: '::',
																	_0: A2(
																		_MichaelCombs28$elm_mdl$Material_Options$when,
																		A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'overflow', 'visible'),
																		_elm_lang$core$Native_Utils.eq(config.mode, _MichaelCombs28$elm_mdl$Material_Layout$Scrolling) && config.fixedHeader),
																	_1: {
																		ctor: '::',
																		_0: A2(
																			_MichaelCombs28$elm_mdl$Material_Options$when,
																			function (_p28) {
																				return _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
																					A2(_elm_lang$html$Html_Events$on, 'scroll', _p28));
																			}(
																				A2(
																					_elm_lang$core$Json_Decode$map,
																					function (_p29) {
																						return lift(
																							A2(_MichaelCombs28$elm_mdl$Material_Layout$ScrollPane, config.fixedHeader, _p29));
																					},
																					_MichaelCombs28$elm_dom$DOM$target(_MichaelCombs28$elm_dom$DOM$scrollTop))),
																			_MichaelCombs28$elm_mdl$Material_Layout$isWaterfall(config.mode)),
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													},
													_p24.main))),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}),
				_1: {ctor: '[]'}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Layout$render = A4(
	_MichaelCombs28$elm_parts$Parts$create1,
	_MichaelCombs28$elm_mdl$Material_Layout$view,
	F3(
		function (x, y, z) {
			return _MichaelCombs28$elm_mdl$Material_Helpers$partsUpdatePort(
				A3(_MichaelCombs28$elm_mdl$Material_Layout$update_, x, y, z));
		}),
	function (_) {
		return _.layout;
	},
	F2(
		function (x, c) {
			return _elm_lang$core$Native_Utils.update(
				c,
				{layout: x});
		}));

var _MichaelCombs28$elm_mdl$Material_Toggles$group = function (s) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					group: _elm_lang$core$Maybe$Just(
						_elm_lang$html$Html_Attributes$name(s))
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Toggles$value = function (b) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{value: b});
		});
};
var _MichaelCombs28$elm_mdl$Material_Toggles$disabled = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{isDisabled: true});
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$ripple = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{ripple: true});
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$onClick = function (x) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{
					onClick: _elm_lang$core$Maybe$Just(
						A2(
							_elm_lang$html$Html_Events$on,
							'change',
							_elm_lang$core$Json_Decode$succeed(x)))
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Toggles$defaultConfig = {
	isDisabled: false,
	value: false,
	ripple: false,
	group: _elm_lang$core$Maybe$Nothing,
	onClick: _elm_lang$core$Maybe$Nothing,
	inner: {ctor: '[]'}
};
var _MichaelCombs28$elm_mdl$Material_Toggles$defaultModel = {ripple: _MichaelCombs28$elm_mdl$Material_Ripple$model, isFocused: false};
var _MichaelCombs28$elm_mdl$Material_Toggles$Model = F2(
	function (a, b) {
		return {ripple: a, isFocused: b};
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$Config = F6(
	function (a, b, c, d, e, f) {
		return {isDisabled: a, value: b, ripple: c, group: d, onClick: e, inner: f};
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$SetFocus = function (a) {
	return {ctor: 'SetFocus', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Toggles$Ripple = function (a) {
	return {ctor: 'Ripple', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Toggles$update = F2(
	function (action, model) {
		var _p0 = action;
		if (_p0.ctor === 'Ripple') {
			return A2(
				_MichaelCombs28$elm_mdl$Material_Helpers$map2nd,
				_elm_lang$core$Platform_Cmd$map(_MichaelCombs28$elm_mdl$Material_Toggles$Ripple),
				A2(
					_MichaelCombs28$elm_mdl$Material_Helpers$map1st,
					function (r) {
						return _elm_lang$core$Native_Utils.update(
							model,
							{ripple: r});
					},
					A2(_MichaelCombs28$elm_mdl$Material_Ripple$update, _p0._0, model.ripple)));
		} else {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{isFocused: _p0._0}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		}
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$render = function (view) {
	return A5(
		_MichaelCombs28$elm_parts$Parts$create,
		view,
		_MichaelCombs28$elm_parts$Parts$generalize(_MichaelCombs28$elm_mdl$Material_Toggles$update),
		function (_) {
			return _.toggles;
		},
		F2(
			function (x, y) {
				return _elm_lang$core$Native_Utils.update(
					y,
					{toggles: x});
			}),
		_MichaelCombs28$elm_mdl$Material_Toggles$defaultModel);
};
var _MichaelCombs28$elm_mdl$Material_Toggles$top = F5(
	function (lift, group, model, summary, elems) {
		var cfg = summary.config;
		return A5(
			_MichaelCombs28$elm_mdl$Material_Options$apply,
			summary,
			_elm_lang$html$Html$label,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs(
					A2(_elm_lang$core$Basics_ops['++'], 'mdl-', group)),
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Options$cs(
						A2(_elm_lang$core$Basics_ops['++'], 'mdl-js-', group)),
					_1: {
						ctor: '::',
						_0: A2(
							_MichaelCombs28$elm_mdl$Material_Options$when,
							_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-ripple-effect'),
							cfg.ripple),
						_1: {
							ctor: '::',
							_0: A2(
								_MichaelCombs28$elm_mdl$Material_Options$when,
								_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-ripple-effect--ignore-events'),
								cfg.ripple),
							_1: {
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Options$cs('is-upgraded'),
								_1: {
									ctor: '::',
									_0: A2(
										_MichaelCombs28$elm_mdl$Material_Options$when,
										_MichaelCombs28$elm_mdl$Material_Options$cs('is-checked'),
										cfg.value),
									_1: {
										ctor: '::',
										_0: A2(
											_MichaelCombs28$elm_mdl$Material_Options$when,
											_MichaelCombs28$elm_mdl$Material_Options$cs('is-focused'),
											model.isFocused),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			},
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Helpers$blurOn('mouseup'),
				_1: {
					ctor: '::',
					_0: _elm_lang$html$Html_Events$onFocus(
						lift(
							_MichaelCombs28$elm_mdl$Material_Toggles$SetFocus(true))),
					_1: {
						ctor: '::',
						_0: _elm_lang$html$Html_Events$onBlur(
							lift(
								_MichaelCombs28$elm_mdl$Material_Toggles$SetFocus(false))),
						_1: {
							ctor: '::',
							_0: A2(_elm_lang$core$Maybe$withDefault, _MichaelCombs28$elm_mdl$Material_Helpers$noAttr, cfg.onClick),
							_1: {ctor: '[]'}
						}
					}
				}
			},
			_elm_lang$core$List$concat(
				{
					ctor: '::',
					_0: elems,
					_1: {
						ctor: '::',
						_0: cfg.ripple ? {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$map,
								function (_p1) {
									return lift(
										_MichaelCombs28$elm_mdl$Material_Toggles$Ripple(_p1));
								},
								A2(
									_MichaelCombs28$elm_mdl$Material_Ripple$view,
									{
										ctor: '::',
										_0: _elm_lang$html$Html_Attributes$class('mdl-switch__ripple-container mdl-js-ripple-effect mdl-ripple--center'),
										_1: {ctor: '[]'}
									},
									model.ripple)),
							_1: {ctor: '[]'}
						} : {ctor: '[]'},
						_1: {ctor: '[]'}
					}
				}));
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$viewCheckbox = F4(
	function (lift, model, config, elems) {
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Toggles$defaultConfig, config);
		var cfg = summary.config;
		return A5(
			_MichaelCombs28$elm_mdl$Material_Toggles$top,
			lift,
			'checkbox',
			model,
			summary,
			{
				ctor: '::',
				_0: A4(
					_MichaelCombs28$elm_mdl$Material_Options$styled_,
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-checkbox__input'),
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$many(cfg.inner),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('checkbox'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$disabled(cfg.isDisabled),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$checked(cfg.value),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$span,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('mdl-checkbox__label'),
							_1: {ctor: '[]'}
						},
						elems),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$span,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mdl-checkbox__focus-helper'),
								_1: {ctor: '[]'}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$span,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('mdl-checkbox__box-outline'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$span,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('mdl-checkbox__tick-outline'),
											_1: {ctor: '[]'}
										},
										{ctor: '[]'}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$checkbox = _MichaelCombs28$elm_mdl$Material_Toggles$render(_MichaelCombs28$elm_mdl$Material_Toggles$viewCheckbox);
var _MichaelCombs28$elm_mdl$Material_Toggles$viewSwitch = F4(
	function (lift, model, config, elems) {
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Toggles$defaultConfig, config);
		var cfg = summary.config;
		return A5(
			_MichaelCombs28$elm_mdl$Material_Toggles$top,
			lift,
			'switch',
			model,
			summary,
			{
				ctor: '::',
				_0: A4(
					_MichaelCombs28$elm_mdl$Material_Options$styled_,
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-switch__input'),
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$many(cfg.inner),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('checkbox'),
						_1: {
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$disabled(cfg.isDisabled),
							_1: {
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$checked(cfg.value),
								_1: {ctor: '[]'}
							}
						}
					},
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$span,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('mdl-switch__label'),
							_1: {ctor: '[]'}
						},
						elems),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$div,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mdl-switch__track'),
								_1: {ctor: '[]'}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$div,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('mdl-switch__thumb'),
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$span,
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('mdl-switch__focus-helper'),
											_1: {ctor: '[]'}
										},
										{ctor: '[]'}),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$switch = _MichaelCombs28$elm_mdl$Material_Toggles$render(_MichaelCombs28$elm_mdl$Material_Toggles$viewSwitch);
var _MichaelCombs28$elm_mdl$Material_Toggles$viewRadio = F4(
	function (lift, model, config, elems) {
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Toggles$defaultConfig, config);
		var cfg = summary.config;
		return A5(
			_MichaelCombs28$elm_mdl$Material_Toggles$top,
			lift,
			'radio',
			model,
			summary,
			{
				ctor: '::',
				_0: A4(
					_MichaelCombs28$elm_mdl$Material_Options$styled_,
					_elm_lang$html$Html$input,
					{
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-radio__button'),
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$many(cfg.inner),
							_1: {ctor: '[]'}
						}
					},
					A2(
						_elm_lang$core$List$filterMap,
						_elm_lang$core$Basics$identity,
						{
							ctor: '::',
							_0: _elm_lang$core$Maybe$Just(
								_elm_lang$html$Html_Attributes$type_('radio')),
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Maybe$Just(
									_elm_lang$html$Html_Attributes$disabled(cfg.isDisabled)),
								_1: {
									ctor: '::',
									_0: _elm_lang$core$Maybe$Just(
										_elm_lang$html$Html_Attributes$checked(cfg.value)),
									_1: {
										ctor: '::',
										_0: cfg.group,
										_1: {ctor: '[]'}
									}
								}
							}
						}),
					{ctor: '[]'}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$span,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$class('mdl-radio__label'),
							_1: {ctor: '[]'}
						},
						elems),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$span,
							{
								ctor: '::',
								_0: _elm_lang$html$Html_Attributes$class('mdl-radio__outer-circle'),
								_1: {ctor: '[]'}
							},
							{ctor: '[]'}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$html$Html$span,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('mdl-radio__inner-circle'),
									_1: {ctor: '[]'}
								},
								{ctor: '[]'}),
							_1: {ctor: '[]'}
						}
					}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Toggles$radio = _MichaelCombs28$elm_mdl$Material_Toggles$render(_MichaelCombs28$elm_mdl$Material_Toggles$viewRadio);

var _MichaelCombs28$elm_mdl$Material_Tooltip$set = F2(
	function (x, y) {
		return _elm_lang$core$Native_Utils.update(
			y,
			{tooltip: x});
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$container = function (elem) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (options) {
			return _elm_lang$core$Native_Utils.update(
				options,
				{container: elem});
		});
};
var _MichaelCombs28$elm_mdl$Material_Tooltip$isTooltipClass = function (path) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		function ($class) {
			return A2(_elm_lang$core$String$contains, 'mdl-tooltip', $class) ? _elm_lang$core$Json_Decode$succeed(true) : _elm_lang$core$Json_Decode$succeed(false);
		},
		A2(_elm_lang$core$Json_Decode$at, path, _MichaelCombs28$elm_dom$DOM$className));
};
var _MichaelCombs28$elm_mdl$Material_Tooltip$sibling = function (d) {
	var valid = function (path) {
		return A2(
			_elm_lang$core$Json_Decode$andThen,
			function (res) {
				return res ? A2(_elm_lang$core$Json_Decode$at, path, d) : _elm_lang$core$Json_Decode$fail('');
			},
			_MichaelCombs28$elm_mdl$Material_Tooltip$isTooltipClass(path));
	};
	var createPath = function (depth) {
		var parents = A2(_elm_lang$core$List$repeat, depth, 'parentElement');
		return A2(
			_elm_lang$core$Basics_ops['++'],
			{
				ctor: '::',
				_0: 'target',
				_1: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$Basics_ops['++'],
				parents,
				{
					ctor: '::',
					_0: 'nextSibling',
					_1: {ctor: '[]'}
				}));
	};
	var paths = A2(
		_elm_lang$core$List$map,
		createPath,
		A2(_elm_lang$core$List$range, 0, 4));
	return _elm_lang$core$Json_Decode$oneOf(
		A2(_elm_lang$core$List$map, valid, paths));
};
var _MichaelCombs28$elm_mdl$Material_Tooltip$update = F2(
	function (action, model) {
		var _p0 = action;
		if (_p0.ctor === 'Enter') {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{isActive: true, domState: _p0._0}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		} else {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{isActive: false}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		}
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$calculatePos = F2(
	function (pos, domState) {
		var getValuesFor = F2(
			function (l, r) {
				return (_elm_lang$core$Native_Utils.cmp(l + r, 0) < 0) ? {ctor: '_Tuple2', _0: 0, _1: 0} : {ctor: '_Tuple2', _0: l, _1: r};
			});
		var offsetHeight = domState.offsetHeight;
		var marginTop = -1 * (offsetHeight / 2);
		var offsetWidth = domState.offsetWidth;
		var marginLeft = -1 * (offsetWidth / 2);
		var props = domState.rect;
		var left = props.left + (props.width / 2);
		var _p1 = A2(getValuesFor, left, marginLeft);
		var newLeft = _p1._0;
		var newMarginLeft = _p1._1;
		var top = props.top + (props.height / 2);
		var _p2 = A2(getValuesFor, top, marginTop);
		var newTop = _p2._0;
		var newMarginTop = _p2._1;
		var out = function () {
			var _p3 = pos;
			switch (_p3.ctor) {
				case 'Left':
					return {left: (props.left - offsetWidth) - 10, top: newTop, marginTop: newMarginTop, marginLeft: 0};
				case 'Right':
					return {left: (props.left + props.width) + 10, top: newTop, marginTop: newMarginTop, marginLeft: 0};
				case 'Top':
					return {left: newLeft, top: (props.top - offsetHeight) - 10, marginTop: 0, marginLeft: newMarginLeft};
				default:
					return {left: newLeft, top: (props.top + props.height) + 10, marginTop: 0, marginLeft: newMarginLeft};
			}
		}();
		return out;
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$defaultDOMState = {
	rect: {left: 0, top: 0, width: 0, height: 0},
	offsetWidth: 0,
	offsetHeight: 0
};
var _MichaelCombs28$elm_mdl$Material_Tooltip$defaultPos = {left: 0, top: 0, marginLeft: 0, marginTop: 0};
var _MichaelCombs28$elm_mdl$Material_Tooltip$defaultModel = {isActive: false, domState: _MichaelCombs28$elm_mdl$Material_Tooltip$defaultDOMState};
var _MichaelCombs28$elm_mdl$Material_Tooltip$pack = A4(
	_MichaelCombs28$elm_parts$Parts$pack,
	_MichaelCombs28$elm_parts$Parts$generalize(_MichaelCombs28$elm_mdl$Material_Tooltip$update),
	function (_) {
		return _.tooltip;
	},
	_MichaelCombs28$elm_mdl$Material_Tooltip$set,
	_MichaelCombs28$elm_mdl$Material_Tooltip$defaultModel);
var _MichaelCombs28$elm_mdl$Material_Tooltip$Model = F2(
	function (a, b) {
		return {isActive: a, domState: b};
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$Pos = F4(
	function (a, b, c, d) {
		return {left: a, top: b, marginLeft: c, marginTop: d};
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$DOMState = F3(
	function (a, b, c) {
		return {rect: a, offsetWidth: b, offsetHeight: c};
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$stateDecoder = A4(
	_elm_lang$core$Json_Decode$map3,
	_MichaelCombs28$elm_mdl$Material_Tooltip$DOMState,
	_MichaelCombs28$elm_dom$DOM$target(_MichaelCombs28$elm_dom$DOM$boundingClientRect),
	_MichaelCombs28$elm_mdl$Material_Tooltip$sibling(_MichaelCombs28$elm_dom$DOM$offsetWidth),
	_MichaelCombs28$elm_mdl$Material_Tooltip$sibling(_MichaelCombs28$elm_dom$DOM$offsetHeight));
var _MichaelCombs28$elm_mdl$Material_Tooltip$Config = F3(
	function (a, b, c) {
		return {size: a, position: b, container: c};
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$Leave = {ctor: 'Leave'};
var _MichaelCombs28$elm_mdl$Material_Tooltip$onMouseLeave = F2(
	function (lift, idx) {
		return A2(
			_elm_lang$html$Html_Events$on,
			'mouseleave',
			_elm_lang$core$Json_Decode$succeed(
				A3(_MichaelCombs28$elm_mdl$Material_Tooltip$pack, lift, idx, _MichaelCombs28$elm_mdl$Material_Tooltip$Leave)));
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$onLeave = function (lift) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseleave',
		_elm_lang$core$Json_Decode$succeed(
			lift(_MichaelCombs28$elm_mdl$Material_Tooltip$Leave)));
};
var _MichaelCombs28$elm_mdl$Material_Tooltip$Enter = function (a) {
	return {ctor: 'Enter', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Tooltip$onMouseEnter = F2(
	function (lift, idx) {
		return A2(
			_elm_lang$html$Html_Events$on,
			'mouseenter',
			A2(
				_elm_lang$core$Json_Decode$map,
				function (_p4) {
					return A3(
						_MichaelCombs28$elm_mdl$Material_Tooltip$pack,
						lift,
						idx,
						_MichaelCombs28$elm_mdl$Material_Tooltip$Enter(_p4));
				},
				_MichaelCombs28$elm_mdl$Material_Tooltip$stateDecoder));
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$attach = F2(
	function (lift, index) {
		return _MichaelCombs28$elm_mdl$Material_Options$many(
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
					A2(_MichaelCombs28$elm_mdl$Material_Tooltip$onMouseEnter, lift, index)),
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
						A2(_MichaelCombs28$elm_mdl$Material_Tooltip$onMouseLeave, lift, index)),
					_1: {ctor: '[]'}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$onEnter = function (lift) {
	return A2(
		_elm_lang$html$Html_Events$on,
		'mouseenter',
		A2(
			_elm_lang$core$Json_Decode$map,
			function (_p5) {
				return lift(
					_MichaelCombs28$elm_mdl$Material_Tooltip$Enter(_p5));
			},
			_MichaelCombs28$elm_mdl$Material_Tooltip$stateDecoder));
};
var _MichaelCombs28$elm_mdl$Material_Tooltip$Large = {ctor: 'Large'};
var _MichaelCombs28$elm_mdl$Material_Tooltip$large = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{size: _MichaelCombs28$elm_mdl$Material_Tooltip$Large});
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$Default = {ctor: 'Default'};
var _MichaelCombs28$elm_mdl$Material_Tooltip$Bottom = {ctor: 'Bottom'};
var _MichaelCombs28$elm_mdl$Material_Tooltip$defaultConfig = {size: _MichaelCombs28$elm_mdl$Material_Tooltip$Default, position: _MichaelCombs28$elm_mdl$Material_Tooltip$Bottom, container: _elm_lang$html$Html$div};
var _MichaelCombs28$elm_mdl$Material_Tooltip$view = F4(
	function (lift, model, options, content) {
		var px = function (f) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(f),
				'px');
		};
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Tooltip$defaultConfig, options);
		var config = summary.config;
		var pos = model.isActive ? A2(_MichaelCombs28$elm_mdl$Material_Tooltip$calculatePos, config.position, model.domState) : _MichaelCombs28$elm_mdl$Material_Tooltip$defaultPos;
		return A3(
			_MichaelCombs28$elm_mdl$Material_Options$styled,
			config.container,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-tooltip'),
				_1: {
					ctor: '::',
					_0: A2(
						_MichaelCombs28$elm_mdl$Material_Options$when,
						_MichaelCombs28$elm_mdl$Material_Options$cs('is-active'),
						model.isActive),
					_1: {
						ctor: '::',
						_0: A2(
							_MichaelCombs28$elm_mdl$Material_Options$when,
							_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-tooltip--large'),
							_elm_lang$core$Native_Utils.eq(config.size, _MichaelCombs28$elm_mdl$Material_Tooltip$Large)),
						_1: {
							ctor: '::',
							_0: A2(
								_MichaelCombs28$elm_mdl$Material_Options$when,
								A2(
									_MichaelCombs28$elm_mdl$Material_Options$css,
									'left',
									px(pos.left)),
								model.isActive),
							_1: {
								ctor: '::',
								_0: A2(
									_MichaelCombs28$elm_mdl$Material_Options$when,
									A2(
										_MichaelCombs28$elm_mdl$Material_Options$css,
										'margin-left',
										px(pos.marginLeft)),
									model.isActive),
								_1: {
									ctor: '::',
									_0: A2(
										_MichaelCombs28$elm_mdl$Material_Options$when,
										A2(
											_MichaelCombs28$elm_mdl$Material_Options$css,
											'top',
											px(pos.top)),
										model.isActive),
									_1: {
										ctor: '::',
										_0: A2(
											_MichaelCombs28$elm_mdl$Material_Options$when,
											A2(
												_MichaelCombs28$elm_mdl$Material_Options$css,
												'margin-top',
												px(pos.marginTop)),
											model.isActive),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					}
				}
			},
			content);
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$render = A5(
	_MichaelCombs28$elm_parts$Parts$create,
	_MichaelCombs28$elm_mdl$Material_Tooltip$view,
	_MichaelCombs28$elm_parts$Parts$generalize(_MichaelCombs28$elm_mdl$Material_Tooltip$update),
	function (_) {
		return _.tooltip;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{tooltip: x});
		}),
	_MichaelCombs28$elm_mdl$Material_Tooltip$defaultModel);
var _MichaelCombs28$elm_mdl$Material_Tooltip$bottom = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{position: _MichaelCombs28$elm_mdl$Material_Tooltip$Bottom});
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$Top = {ctor: 'Top'};
var _MichaelCombs28$elm_mdl$Material_Tooltip$top = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{position: _MichaelCombs28$elm_mdl$Material_Tooltip$Top});
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$Right = {ctor: 'Right'};
var _MichaelCombs28$elm_mdl$Material_Tooltip$right = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{position: _MichaelCombs28$elm_mdl$Material_Tooltip$Right});
	});
var _MichaelCombs28$elm_mdl$Material_Tooltip$Left = {ctor: 'Left'};
var _MichaelCombs28$elm_mdl$Material_Tooltip$left = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{position: _MichaelCombs28$elm_mdl$Material_Tooltip$Left});
	});

var _MichaelCombs28$elm_mdl$Material_Tabs$activeTab = function (k) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{activeTab: k});
		});
};
var _MichaelCombs28$elm_mdl$Material_Tabs$onSelectTab = function (k) {
	return _MichaelCombs28$elm_mdl$Material_Options$set(
		function (config) {
			return _elm_lang$core$Native_Utils.update(
				config,
				{
					onSelectTab: _elm_lang$core$Maybe$Just(k)
				});
		});
};
var _MichaelCombs28$elm_mdl$Material_Tabs$ripple = _MichaelCombs28$elm_mdl$Material_Options$set(
	function (options) {
		return _elm_lang$core$Native_Utils.update(
			options,
			{ripple: true});
	});
var _MichaelCombs28$elm_mdl$Material_Tabs$defaultConfig = {ripple: false, onSelectTab: _elm_lang$core$Maybe$Nothing, activeTab: 0};
var _MichaelCombs28$elm_mdl$Material_Tabs$defaultModel = {ripples: _elm_lang$core$Dict$empty};
var _MichaelCombs28$elm_mdl$Material_Tabs$Model = function (a) {
	return {ripples: a};
};
var _MichaelCombs28$elm_mdl$Material_Tabs$Config = F3(
	function (a, b, c) {
		return {ripple: a, onSelectTab: b, activeTab: c};
	});
var _MichaelCombs28$elm_mdl$Material_Tabs$Ripple = F2(
	function (a, b) {
		return {ctor: 'Ripple', _0: a, _1: b};
	});
var _MichaelCombs28$elm_mdl$Material_Tabs$update = F2(
	function (action, model) {
		var _p0 = action;
		var _p2 = _p0._0;
		var _p1 = A2(
			_MichaelCombs28$elm_mdl$Material_Ripple$update,
			_p0._1,
			A2(
				_elm_lang$core$Maybe$withDefault,
				_MichaelCombs28$elm_mdl$Material_Ripple$model,
				A2(_elm_lang$core$Dict$get, _p2, model.ripples)));
		var ripple_ = _p1._0;
		var cmd = _p1._1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{
					ripples: A3(_elm_lang$core$Dict$insert, _p2, ripple_, model.ripples)
				}),
			_1: A2(
				_elm_lang$core$Platform_Cmd$map,
				_MichaelCombs28$elm_mdl$Material_Tabs$Ripple(_p2),
				cmd)
		};
	});
var _MichaelCombs28$elm_mdl$Material_Tabs$view = F5(
	function (lift, model, options, tabs, tabContent) {
		var wrapContent = A2(
			_elm_lang$html$Html_Keyed$node,
			'div',
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$classList(
					{
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'mdl-tab__panel', _1: true},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'is-active', _1: true},
							_1: {ctor: '[]'}
						}
					}),
				_1: {ctor: '[]'}
			});
		var summary = A2(_MichaelCombs28$elm_mdl$Material_Options$collect, _MichaelCombs28$elm_mdl$Material_Tabs$defaultConfig, options);
		var config = summary.config;
		var unwrapLabel = F2(
			function (tabIdx, _p3) {
				var _p4 = _p3;
				var _p6 = _p4._0._1;
				return A3(
					_MichaelCombs28$elm_mdl$Material_Options$styled,
					_elm_lang$html$Html$a,
					A2(
						_elm_lang$core$Basics_ops['++'],
						{
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-tabs__tab'),
							_1: {
								ctor: '::',
								_0: A2(
									_MichaelCombs28$elm_mdl$Material_Options$when,
									_MichaelCombs28$elm_mdl$Material_Options$cs('is-active'),
									_elm_lang$core$Native_Utils.eq(tabIdx, config.activeTab)),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$core$Maybe$withDefault,
										_MichaelCombs28$elm_mdl$Material_Options$nop,
										A2(
											_elm_lang$core$Maybe$map,
											function (t) {
												return _MichaelCombs28$elm_mdl$Material_Options_Internal$attribute(
													_elm_lang$html$Html_Events$onClick(
														t(tabIdx)));
											},
											config.onSelectTab)),
									_1: {ctor: '[]'}
								}
							}
						},
						_p4._0._0),
					config.ripple ? _elm_lang$core$List$concat(
						{
							ctor: '::',
							_0: _p6,
							_1: {
								ctor: '::',
								_0: {
									ctor: '::',
									_0: A2(
										_elm_lang$html$Html$map,
										function (_p5) {
											return lift(
												A2(_MichaelCombs28$elm_mdl$Material_Tabs$Ripple, tabIdx, _p5));
										},
										A2(
											_MichaelCombs28$elm_mdl$Material_Ripple$view,
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$classList(
													{
														ctor: '::',
														_0: {ctor: '_Tuple2', _0: 'mdl-tabs__ripple-container', _1: true},
														_1: {
															ctor: '::',
															_0: {ctor: '_Tuple2', _0: 'mdl-tabs__ripple-js-effect', _1: true},
															_1: {ctor: '[]'}
														}
													}),
												_1: {ctor: '[]'}
											},
											A2(
												_elm_lang$core$Maybe$withDefault,
												_MichaelCombs28$elm_mdl$Material_Ripple$model,
												A2(_elm_lang$core$Dict$get, tabIdx, model.ripples)))),
									_1: {ctor: '[]'}
								},
								_1: {ctor: '[]'}
							}
						}) : _p6);
			});
		var links = A3(
			_MichaelCombs28$elm_mdl$Material_Options$styled,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-tabs__tab-bar'),
				_1: {ctor: '[]'}
			},
			A2(_elm_lang$core$List$indexedMap, unwrapLabel, tabs));
		return A5(
			_MichaelCombs28$elm_mdl$Material_Options$apply,
			summary,
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-tabs'),
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-tabs'),
					_1: {
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Options$cs('is-upgraded'),
						_1: {
							ctor: '::',
							_0: A2(
								_MichaelCombs28$elm_mdl$Material_Options$when,
								_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-ripple-effect'),
								config.ripple),
							_1: {
								ctor: '::',
								_0: A2(
									_MichaelCombs28$elm_mdl$Material_Options$when,
									_MichaelCombs28$elm_mdl$Material_Options$cs('mdl-js-ripple-effect--ignore-events'),
									config.ripple),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			},
			{ctor: '[]'},
			{
				ctor: '::',
				_0: links,
				_1: {
					ctor: '::',
					_0: wrapContent(
						{
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Basics$toString(config.activeTab),
								_1: A2(
									_elm_lang$html$Html$div,
									{ctor: '[]'},
									tabContent)
							},
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Tabs$render = A5(
	_MichaelCombs28$elm_parts$Parts$create,
	_MichaelCombs28$elm_mdl$Material_Tabs$view,
	_MichaelCombs28$elm_parts$Parts$generalize(_MichaelCombs28$elm_mdl$Material_Tabs$update),
	function (_) {
		return _.tabs;
	},
	F2(
		function (x, y) {
			return _elm_lang$core$Native_Utils.update(
				y,
				{tabs: x});
		}),
	_MichaelCombs28$elm_mdl$Material_Tabs$defaultModel);
var _MichaelCombs28$elm_mdl$Material_Tabs$Label = function (a) {
	return {ctor: 'Label', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Tabs$label = F2(
	function (p, c) {
		return _MichaelCombs28$elm_mdl$Material_Tabs$Label(
			{ctor: '_Tuple2', _0: p, _1: c});
	});
var _MichaelCombs28$elm_mdl$Material_Tabs$textLabel = F2(
	function (p, c) {
		return A2(
			_MichaelCombs28$elm_mdl$Material_Tabs$label,
			p,
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(c),
				_1: {ctor: '[]'}
			});
	});

var _MichaelCombs28$elm_mdl$Material$init = function (lift) {
	return _MichaelCombs28$elm_mdl$Material_Layout$sub0(lift);
};
var _MichaelCombs28$elm_mdl$Material$subscriptions = F2(
	function (lift, model) {
		return _elm_lang$core$Platform_Sub$batch(
			{
				ctor: '::',
				_0: A2(_MichaelCombs28$elm_mdl$Material_Layout$subs, lift, model.mdl),
				_1: {
					ctor: '::',
					_0: A2(_MichaelCombs28$elm_mdl$Material_Menu$subs, lift, model.mdl),
					_1: {ctor: '[]'}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material$update = F2(
	function (msg, model) {
		var helper = function (_p0) {
			var _p1 = _p0;
			var _p2 = _p1._0;
			if (_p2.ctor === 'Just') {
				return _elm_lang$core$Maybe$Just(
					{ctor: '_Tuple2', _0: _p2._0, _1: _p1._1});
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		};
		return A2(
			_elm_lang$core$Maybe$withDefault,
			{ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none},
			A2(
				_elm_lang$core$Maybe$map,
				_MichaelCombs28$elm_mdl$Material_Helpers$map1st(
					function (mdl) {
						return _elm_lang$core$Native_Utils.update(
							model,
							{mdl: mdl});
					}),
				helper(
					A2(_MichaelCombs28$elm_parts$Parts$update_, msg, model.mdl))));
	});
var _MichaelCombs28$elm_mdl$Material$model = {button: _elm_lang$core$Dict$empty, textfield: _elm_lang$core$Dict$empty, menu: _elm_lang$core$Dict$empty, snackbar: _elm_lang$core$Maybe$Nothing, layout: _MichaelCombs28$elm_mdl$Material_Layout$defaultModel, toggles: _elm_lang$core$Dict$empty, tooltip: _elm_lang$core$Dict$empty, tabs: _elm_lang$core$Dict$empty};
var _MichaelCombs28$elm_mdl$Material$Model = F8(
	function (a, b, c, d, e, f, g, h) {
		return {button: a, textfield: b, menu: c, snackbar: d, layout: e, toggles: f, tooltip: g, tabs: h};
	});

var _MichaelCombs28$elm_mdl$Material_Color$text = function (_p0) {
	var _p1 = _p0;
	return _MichaelCombs28$elm_mdl$Material_Options$cs(
		A2(_elm_lang$core$Basics_ops['++'], 'mdl-color-text--', _p1._0));
};
var _MichaelCombs28$elm_mdl$Material_Color$background = function (_p2) {
	var _p3 = _p2;
	return _MichaelCombs28$elm_mdl$Material_Options$cs(
		A2(_elm_lang$core$Basics_ops['++'], 'mdl-color--', _p3._0));
};
var _MichaelCombs28$elm_mdl$Material_Color$shadeName = function (shade) {
	var _p4 = shade;
	switch (_p4.ctor) {
		case 'S50':
			return '50';
		case 'S100':
			return '100';
		case 'S200':
			return '200';
		case 'S300':
			return '300';
		case 'S400':
			return '400';
		case 'S500':
			return '500';
		case 'S600':
			return '600';
		case 'S700':
			return '700';
		case 'S800':
			return '800';
		case 'S900':
			return '900';
		case 'A100':
			return 'A100';
		case 'A200':
			return 'A200';
		case 'A400':
			return 'A400';
		default:
			return 'A700';
	}
};
var _MichaelCombs28$elm_mdl$Material_Color$hueName = function (color) {
	var _p5 = color;
	switch (_p5.ctor) {
		case 'Indigo':
			return 'indigo';
		case 'Blue':
			return 'blue';
		case 'LightBlue':
			return 'light-blue';
		case 'Cyan':
			return 'cyan';
		case 'Teal':
			return 'teal';
		case 'Green':
			return 'green';
		case 'LightGreen':
			return 'light-green';
		case 'Lime':
			return 'lime';
		case 'Yellow':
			return 'yellow';
		case 'Amber':
			return 'amber';
		case 'Orange':
			return 'orange';
		case 'Brown':
			return 'brown';
		case 'BlueGrey':
			return 'blue-grey';
		case 'Grey':
			return 'grey';
		case 'DeepOrange':
			return 'deep-orange';
		case 'Red':
			return 'red';
		case 'Pink':
			return 'pink';
		case 'Purple':
			return 'purple';
		default:
			return 'deep-purple';
	}
};
var _MichaelCombs28$elm_mdl$Material_Color$scheme = F2(
	function (primary, accent) {
		var q = _elm_lang$core$String$map(
			function (x) {
				return _elm_lang$core$Native_Utils.eq(
					x,
					_elm_lang$core$Native_Utils.chr('-')) ? _elm_lang$core$Native_Utils.chr('_') : x;
			});
		var cssFile = function () {
			var _p6 = accent;
			switch (_p6.ctor) {
				case 'Grey':
					return '';
				case 'Brown':
					return '';
				case 'BlueGrey':
					return '';
				default:
					return A2(
						_elm_lang$core$Basics_ops['++'],
						'.',
						A2(
							_elm_lang$core$Basics_ops['++'],
							q(
								_MichaelCombs28$elm_mdl$Material_Color$hueName(primary)),
							A2(
								_elm_lang$core$Basics_ops['++'],
								'-',
								q(
									_MichaelCombs28$elm_mdl$Material_Color$hueName(accent)))));
			}
		}();
		return A2(
			_elm_lang$core$Basics_ops['++'],
			'material',
			A2(_elm_lang$core$Basics_ops['++'], cssFile, '.min.css'));
	});
var _MichaelCombs28$elm_mdl$Material_Color$DeepPurple = {ctor: 'DeepPurple'};
var _MichaelCombs28$elm_mdl$Material_Color$Purple = {ctor: 'Purple'};
var _MichaelCombs28$elm_mdl$Material_Color$Pink = {ctor: 'Pink'};
var _MichaelCombs28$elm_mdl$Material_Color$Red = {ctor: 'Red'};
var _MichaelCombs28$elm_mdl$Material_Color$DeepOrange = {ctor: 'DeepOrange'};
var _MichaelCombs28$elm_mdl$Material_Color$Grey = {ctor: 'Grey'};
var _MichaelCombs28$elm_mdl$Material_Color$BlueGrey = {ctor: 'BlueGrey'};
var _MichaelCombs28$elm_mdl$Material_Color$Brown = {ctor: 'Brown'};
var _MichaelCombs28$elm_mdl$Material_Color$Orange = {ctor: 'Orange'};
var _MichaelCombs28$elm_mdl$Material_Color$Amber = {ctor: 'Amber'};
var _MichaelCombs28$elm_mdl$Material_Color$Yellow = {ctor: 'Yellow'};
var _MichaelCombs28$elm_mdl$Material_Color$Lime = {ctor: 'Lime'};
var _MichaelCombs28$elm_mdl$Material_Color$LightGreen = {ctor: 'LightGreen'};
var _MichaelCombs28$elm_mdl$Material_Color$Green = {ctor: 'Green'};
var _MichaelCombs28$elm_mdl$Material_Color$Teal = {ctor: 'Teal'};
var _MichaelCombs28$elm_mdl$Material_Color$Cyan = {ctor: 'Cyan'};
var _MichaelCombs28$elm_mdl$Material_Color$LightBlue = {ctor: 'LightBlue'};
var _MichaelCombs28$elm_mdl$Material_Color$Blue = {ctor: 'Blue'};
var _MichaelCombs28$elm_mdl$Material_Color$Indigo = {ctor: 'Indigo'};
var _MichaelCombs28$elm_mdl$Material_Color$hues = _elm_lang$core$Array$fromList(
	{
		ctor: '::',
		_0: _MichaelCombs28$elm_mdl$Material_Color$Indigo,
		_1: {
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Color$Blue,
			_1: {
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Color$LightBlue,
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Color$Cyan,
					_1: {
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Color$Teal,
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Color$Green,
							_1: {
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Color$LightGreen,
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Color$Lime,
									_1: {
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Color$Yellow,
										_1: {
											ctor: '::',
											_0: _MichaelCombs28$elm_mdl$Material_Color$Amber,
											_1: {
												ctor: '::',
												_0: _MichaelCombs28$elm_mdl$Material_Color$Orange,
												_1: {
													ctor: '::',
													_0: _MichaelCombs28$elm_mdl$Material_Color$Brown,
													_1: {
														ctor: '::',
														_0: _MichaelCombs28$elm_mdl$Material_Color$BlueGrey,
														_1: {
															ctor: '::',
															_0: _MichaelCombs28$elm_mdl$Material_Color$Grey,
															_1: {
																ctor: '::',
																_0: _MichaelCombs28$elm_mdl$Material_Color$DeepOrange,
																_1: {
																	ctor: '::',
																	_0: _MichaelCombs28$elm_mdl$Material_Color$Red,
																	_1: {
																		ctor: '::',
																		_0: _MichaelCombs28$elm_mdl$Material_Color$Pink,
																		_1: {
																			ctor: '::',
																			_0: _MichaelCombs28$elm_mdl$Material_Color$Purple,
																			_1: {
																				ctor: '::',
																				_0: _MichaelCombs28$elm_mdl$Material_Color$DeepPurple,
																				_1: {ctor: '[]'}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _MichaelCombs28$elm_mdl$Material_Color$accentHues = _elm_lang$core$Array$fromList(
	{
		ctor: '::',
		_0: _MichaelCombs28$elm_mdl$Material_Color$Indigo,
		_1: {
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Color$Blue,
			_1: {
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Color$LightBlue,
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Color$Cyan,
					_1: {
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Color$Teal,
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Color$Green,
							_1: {
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Color$LightGreen,
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Color$Lime,
									_1: {
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Color$Yellow,
										_1: {
											ctor: '::',
											_0: _MichaelCombs28$elm_mdl$Material_Color$Amber,
											_1: {
												ctor: '::',
												_0: _MichaelCombs28$elm_mdl$Material_Color$Orange,
												_1: {
													ctor: '::',
													_0: _MichaelCombs28$elm_mdl$Material_Color$DeepOrange,
													_1: {
														ctor: '::',
														_0: _MichaelCombs28$elm_mdl$Material_Color$Red,
														_1: {
															ctor: '::',
															_0: _MichaelCombs28$elm_mdl$Material_Color$Pink,
															_1: {
																ctor: '::',
																_0: _MichaelCombs28$elm_mdl$Material_Color$Purple,
																_1: {
																	ctor: '::',
																	_0: _MichaelCombs28$elm_mdl$Material_Color$DeepPurple,
																	_1: {ctor: '[]'}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _MichaelCombs28$elm_mdl$Material_Color$A700 = {ctor: 'A700'};
var _MichaelCombs28$elm_mdl$Material_Color$A400 = {ctor: 'A400'};
var _MichaelCombs28$elm_mdl$Material_Color$A200 = {ctor: 'A200'};
var _MichaelCombs28$elm_mdl$Material_Color$A100 = {ctor: 'A100'};
var _MichaelCombs28$elm_mdl$Material_Color$S900 = {ctor: 'S900'};
var _MichaelCombs28$elm_mdl$Material_Color$S800 = {ctor: 'S800'};
var _MichaelCombs28$elm_mdl$Material_Color$S700 = {ctor: 'S700'};
var _MichaelCombs28$elm_mdl$Material_Color$S600 = {ctor: 'S600'};
var _MichaelCombs28$elm_mdl$Material_Color$S500 = {ctor: 'S500'};
var _MichaelCombs28$elm_mdl$Material_Color$S400 = {ctor: 'S400'};
var _MichaelCombs28$elm_mdl$Material_Color$S300 = {ctor: 'S300'};
var _MichaelCombs28$elm_mdl$Material_Color$S200 = {ctor: 'S200'};
var _MichaelCombs28$elm_mdl$Material_Color$S100 = {ctor: 'S100'};
var _MichaelCombs28$elm_mdl$Material_Color$S50 = {ctor: 'S50'};
var _MichaelCombs28$elm_mdl$Material_Color$shades = _elm_lang$core$Array$fromList(
	{
		ctor: '::',
		_0: _MichaelCombs28$elm_mdl$Material_Color$S50,
		_1: {
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Color$S100,
			_1: {
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Color$S200,
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Color$S300,
					_1: {
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Color$S400,
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Color$S500,
							_1: {
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Color$S600,
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Color$S700,
									_1: {
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Color$S800,
										_1: {
											ctor: '::',
											_0: _MichaelCombs28$elm_mdl$Material_Color$S900,
											_1: {
												ctor: '::',
												_0: _MichaelCombs28$elm_mdl$Material_Color$A100,
												_1: {
													ctor: '::',
													_0: _MichaelCombs28$elm_mdl$Material_Color$A200,
													_1: {
														ctor: '::',
														_0: _MichaelCombs28$elm_mdl$Material_Color$A400,
														_1: {
															ctor: '::',
															_0: _MichaelCombs28$elm_mdl$Material_Color$A700,
															_1: {ctor: '[]'}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _MichaelCombs28$elm_mdl$Material_Color$C = function (a) {
	return {ctor: 'C', _0: a};
};
var _MichaelCombs28$elm_mdl$Material_Color$color = F2(
	function (hue, shade) {
		return _MichaelCombs28$elm_mdl$Material_Color$C(
			A2(
				_elm_lang$core$Basics_ops['++'],
				_MichaelCombs28$elm_mdl$Material_Color$hueName(hue),
				A2(
					_elm_lang$core$Basics_ops['++'],
					'-',
					_MichaelCombs28$elm_mdl$Material_Color$shadeName(shade))));
	});
var _MichaelCombs28$elm_mdl$Material_Color$white = _MichaelCombs28$elm_mdl$Material_Color$C('white');
var _MichaelCombs28$elm_mdl$Material_Color$black = _MichaelCombs28$elm_mdl$Material_Color$C('black');
var _MichaelCombs28$elm_mdl$Material_Color$primary = _MichaelCombs28$elm_mdl$Material_Color$C('primary');
var _MichaelCombs28$elm_mdl$Material_Color$primaryDark = _MichaelCombs28$elm_mdl$Material_Color$C('primary-dark');
var _MichaelCombs28$elm_mdl$Material_Color$primaryContrast = _MichaelCombs28$elm_mdl$Material_Color$C('primary-contrast');
var _MichaelCombs28$elm_mdl$Material_Color$accent = _MichaelCombs28$elm_mdl$Material_Color$C('accent');
var _MichaelCombs28$elm_mdl$Material_Color$accentContrast = _MichaelCombs28$elm_mdl$Material_Color$C('accent-contrast');

var _MichaelCombs28$elm_mdl$Material_List$action2 = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item-secondary-action');
var _MichaelCombs28$elm_mdl$Material_List$info2 = function (options) {
	return _MichaelCombs28$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item-secondary-info'),
			_1: options
		});
};
var _MichaelCombs28$elm_mdl$Material_List$content2 = function (options) {
	return _MichaelCombs28$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item-secondary-content'),
			_1: options
		});
};
var _MichaelCombs28$elm_mdl$Material_List$subtitle = function (options) {
	return _MichaelCombs28$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item-sub-title'),
			_1: options
		});
};
var _MichaelCombs28$elm_mdl$Material_List$body = function (options) {
	return _MichaelCombs28$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item-text-body'),
			_1: options
		});
};
var _MichaelCombs28$elm_mdl$Material_List$icon = F2(
	function (i, options) {
		return A2(
			_MichaelCombs28$elm_mdl$Material_Icon$view,
			i,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item-icon'),
				_1: options
			});
	});
var _MichaelCombs28$elm_mdl$Material_List$avatar = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item-avatar');
var _MichaelCombs28$elm_mdl$Material_List$avatarImage = F2(
	function (src, options) {
		return A4(
			_MichaelCombs28$elm_mdl$Material_Options$styled_,
			_elm_lang$html$Html$img,
			{ctor: '::', _0: _MichaelCombs28$elm_mdl$Material_List$avatar, _1: options},
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$src(src),
				_1: {ctor: '[]'}
			},
			{ctor: '[]'});
	});
var _MichaelCombs28$elm_mdl$Material_List$avatarIcon = F2(
	function (i, options) {
		return A2(
			_MichaelCombs28$elm_mdl$Material_Options$div,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Options$center,
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Options$many(options),
					_1: {
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_List$avatar,
						_1: {ctor: '[]'}
					}
				}
			},
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Icon$i(i),
				_1: {ctor: '[]'}
			});
	});
var _MichaelCombs28$elm_mdl$Material_List$content = function (options) {
	return _MichaelCombs28$elm_mdl$Material_Options$span(
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item-primary-content'),
			_1: options
		});
};
var _MichaelCombs28$elm_mdl$Material_List$withSubtitle = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item--two-line');
var _MichaelCombs28$elm_mdl$Material_List$withBody = _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item--three-line');
var _MichaelCombs28$elm_mdl$Material_List$li = function (options) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_Options$styled,
		_elm_lang$html$Html$li,
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list__item'),
			_1: options
		});
};
var _MichaelCombs28$elm_mdl$Material_List$ul = function (options) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_Options$styled,
		_elm_lang$html$Html$ul,
		{
			ctor: '::',
			_0: _MichaelCombs28$elm_mdl$Material_Options$cs('mdl-list'),
			_1: options
		});
};

var _MichaelCombs28$elm_mdl$Material_Scheme$scheme = F2(
	function (primary, accent) {
		return A2(
			_elm_lang$core$String$join,
			'\n',
			A2(
				_elm_lang$core$List$map,
				function (url) {
					return A2(
						_elm_lang$core$Basics_ops['++'],
						'@import url(',
						A2(_elm_lang$core$Basics_ops['++'], url, ');'));
				},
				{
					ctor: '::',
					_0: A2(
						_elm_lang$core$Basics_ops['++'],
						'https://code.getmdl.io/1.2.0/',
						A2(_MichaelCombs28$elm_mdl$Material_Color$scheme, primary, accent)),
					_1: {
						ctor: '::',
						_0: 'https://fonts.googleapis.com/icon?family=Material+Icons',
						_1: {
							ctor: '::',
							_0: 'https://fonts.googleapis.com/css?family=Roboto:400,300,500|Roboto+Mono|Roboto+Condensed:400,700&subset=latin,latin-ext',
							_1: {ctor: '[]'}
						}
					}
				}));
	});
var _MichaelCombs28$elm_mdl$Material_Scheme$topWithScheme = F3(
	function (primary, accent, content) {
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: A3(
					_elm_lang$html$Html$node,
					'style',
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$type_('text/css'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: _elm_lang$html$Html$text(
							A2(_MichaelCombs28$elm_mdl$Material_Scheme$scheme, primary, accent)),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: content,
					_1: {ctor: '[]'}
				}
			});
	});
var _MichaelCombs28$elm_mdl$Material_Scheme$top = function (content) {
	return A3(_MichaelCombs28$elm_mdl$Material_Scheme$topWithScheme, _MichaelCombs28$elm_mdl$Material_Color$Grey, _MichaelCombs28$elm_mdl$Material_Color$Grey, content);
};

var _elm_lang$navigation$Native_Navigation = function() {

function go(n)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		if (n !== 0)
		{
			history.go(n);
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function pushState(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		history.pushState({}, '', url);
		callback(_elm_lang$core$Native_Scheduler.succeed(getLocation()));
	});
}

function replaceState(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		history.replaceState({}, '', url);
		callback(_elm_lang$core$Native_Scheduler.succeed(getLocation()));
	});
}

function getLocation()
{
	var location = document.location;

	return {
		href: location.href,
		host: location.host,
		hostname: location.hostname,
		protocol: location.protocol,
		origin: location.origin,
		port_: location.port,
		pathname: location.pathname,
		search: location.search,
		hash: location.hash,
		username: location.username,
		password: location.password
	};
}


return {
	go: go,
	pushState: pushState,
	replaceState: replaceState,
	getLocation: getLocation
};

}();

var _elm_lang$navigation$Navigation$replaceState = _elm_lang$navigation$Native_Navigation.replaceState;
var _elm_lang$navigation$Navigation$pushState = _elm_lang$navigation$Native_Navigation.pushState;
var _elm_lang$navigation$Navigation$go = _elm_lang$navigation$Native_Navigation.go;
var _elm_lang$navigation$Navigation$spawnPopState = function (router) {
	return _elm_lang$core$Process$spawn(
		A3(
			_elm_lang$dom$Dom_LowLevel$onWindow,
			'popstate',
			_elm_lang$core$Json_Decode$value,
			function (_p0) {
				return A2(
					_elm_lang$core$Platform$sendToSelf,
					router,
					_elm_lang$navigation$Native_Navigation.getLocation(
						{ctor: '_Tuple0'}));
			}));
};
var _elm_lang$navigation$Navigation_ops = _elm_lang$navigation$Navigation_ops || {};
_elm_lang$navigation$Navigation_ops['&>'] = F2(
	function (task1, task2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p1) {
				return task2;
			},
			task1);
	});
var _elm_lang$navigation$Navigation$notify = F3(
	function (router, subs, location) {
		var send = function (_p2) {
			var _p3 = _p2;
			return A2(
				_elm_lang$core$Platform$sendToApp,
				router,
				_p3._0(location));
		};
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Task$sequence(
				A2(_elm_lang$core$List$map, send, subs)),
			_elm_lang$core$Task$succeed(
				{ctor: '_Tuple0'}));
	});
var _elm_lang$navigation$Navigation$onSelfMsg = F3(
	function (router, location, state) {
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			A3(_elm_lang$navigation$Navigation$notify, router, state.subs, location),
			_elm_lang$core$Task$succeed(state));
	});
var _elm_lang$navigation$Navigation$cmdHelp = F3(
	function (router, subs, cmd) {
		var _p4 = cmd;
		switch (_p4.ctor) {
			case 'Jump':
				return _elm_lang$navigation$Navigation$go(_p4._0);
			case 'New':
				return A2(
					_elm_lang$core$Task$andThen,
					A2(_elm_lang$navigation$Navigation$notify, router, subs),
					_elm_lang$navigation$Navigation$pushState(_p4._0));
			default:
				return A2(
					_elm_lang$core$Task$andThen,
					A2(_elm_lang$navigation$Navigation$notify, router, subs),
					_elm_lang$navigation$Navigation$replaceState(_p4._0));
		}
	});
var _elm_lang$navigation$Navigation$subscription = _elm_lang$core$Native_Platform.leaf('Navigation');
var _elm_lang$navigation$Navigation$command = _elm_lang$core$Native_Platform.leaf('Navigation');
var _elm_lang$navigation$Navigation$Location = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {href: a, host: b, hostname: c, protocol: d, origin: e, port_: f, pathname: g, search: h, hash: i, username: j, password: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$navigation$Navigation$State = F2(
	function (a, b) {
		return {subs: a, process: b};
	});
var _elm_lang$navigation$Navigation$init = _elm_lang$core$Task$succeed(
	A2(
		_elm_lang$navigation$Navigation$State,
		{ctor: '[]'},
		_elm_lang$core$Maybe$Nothing));
var _elm_lang$navigation$Navigation$onEffects = F4(
	function (router, cmds, subs, _p5) {
		var _p6 = _p5;
		var _p9 = _p6.process;
		var stepState = function () {
			var _p7 = {ctor: '_Tuple2', _0: subs, _1: _p9};
			_v3_2:
			do {
				if (_p7._0.ctor === '[]') {
					if (_p7._1.ctor === 'Just') {
						return A2(
							_elm_lang$navigation$Navigation_ops['&>'],
							_elm_lang$core$Process$kill(_p7._1._0),
							_elm_lang$core$Task$succeed(
								A2(_elm_lang$navigation$Navigation$State, subs, _elm_lang$core$Maybe$Nothing)));
					} else {
						break _v3_2;
					}
				} else {
					if (_p7._1.ctor === 'Nothing') {
						return A2(
							_elm_lang$core$Task$map,
							function (_p8) {
								return A2(
									_elm_lang$navigation$Navigation$State,
									subs,
									_elm_lang$core$Maybe$Just(_p8));
							},
							_elm_lang$navigation$Navigation$spawnPopState(router));
					} else {
						break _v3_2;
					}
				}
			} while(false);
			return _elm_lang$core$Task$succeed(
				A2(_elm_lang$navigation$Navigation$State, subs, _p9));
		}();
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					A2(_elm_lang$navigation$Navigation$cmdHelp, router, subs),
					cmds)),
			stepState);
	});
var _elm_lang$navigation$Navigation$Modify = function (a) {
	return {ctor: 'Modify', _0: a};
};
var _elm_lang$navigation$Navigation$modifyUrl = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Modify(url));
};
var _elm_lang$navigation$Navigation$New = function (a) {
	return {ctor: 'New', _0: a};
};
var _elm_lang$navigation$Navigation$newUrl = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$New(url));
};
var _elm_lang$navigation$Navigation$Jump = function (a) {
	return {ctor: 'Jump', _0: a};
};
var _elm_lang$navigation$Navigation$back = function (n) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Jump(0 - n));
};
var _elm_lang$navigation$Navigation$forward = function (n) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Jump(n));
};
var _elm_lang$navigation$Navigation$cmdMap = F2(
	function (_p10, myCmd) {
		var _p11 = myCmd;
		switch (_p11.ctor) {
			case 'Jump':
				return _elm_lang$navigation$Navigation$Jump(_p11._0);
			case 'New':
				return _elm_lang$navigation$Navigation$New(_p11._0);
			default:
				return _elm_lang$navigation$Navigation$Modify(_p11._0);
		}
	});
var _elm_lang$navigation$Navigation$Monitor = function (a) {
	return {ctor: 'Monitor', _0: a};
};
var _elm_lang$navigation$Navigation$program = F2(
	function (locationToMessage, stuff) {
		var init = stuff.init(
			_elm_lang$navigation$Native_Navigation.getLocation(
				{ctor: '_Tuple0'}));
		var subs = function (model) {
			return _elm_lang$core$Platform_Sub$batch(
				{
					ctor: '::',
					_0: _elm_lang$navigation$Navigation$subscription(
						_elm_lang$navigation$Navigation$Monitor(locationToMessage)),
					_1: {
						ctor: '::',
						_0: stuff.subscriptions(model),
						_1: {ctor: '[]'}
					}
				});
		};
		return _elm_lang$html$Html$program(
			{init: init, view: stuff.view, update: stuff.update, subscriptions: subs});
	});
var _elm_lang$navigation$Navigation$programWithFlags = F2(
	function (locationToMessage, stuff) {
		var init = function (flags) {
			return A2(
				stuff.init,
				flags,
				_elm_lang$navigation$Native_Navigation.getLocation(
					{ctor: '_Tuple0'}));
		};
		var subs = function (model) {
			return _elm_lang$core$Platform_Sub$batch(
				{
					ctor: '::',
					_0: _elm_lang$navigation$Navigation$subscription(
						_elm_lang$navigation$Navigation$Monitor(locationToMessage)),
					_1: {
						ctor: '::',
						_0: stuff.subscriptions(model),
						_1: {ctor: '[]'}
					}
				});
		};
		return _elm_lang$html$Html$programWithFlags(
			{init: init, view: stuff.view, update: stuff.update, subscriptions: subs});
	});
var _elm_lang$navigation$Navigation$subMap = F2(
	function (func, _p12) {
		var _p13 = _p12;
		return _elm_lang$navigation$Navigation$Monitor(
			function (_p14) {
				return func(
					_p13._0(_p14));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Navigation'] = {pkg: 'elm-lang/navigation', init: _elm_lang$navigation$Navigation$init, onEffects: _elm_lang$navigation$Navigation$onEffects, onSelfMsg: _elm_lang$navigation$Navigation$onSelfMsg, tag: 'fx', cmdMap: _elm_lang$navigation$Navigation$cmdMap, subMap: _elm_lang$navigation$Navigation$subMap};

var _user$project$Strengths$clean = function (text) {
	return _elm_lang$core$String$trim(
		_elm_lang$core$String$toLower(text));
};
var _user$project$Strengths$codeList = {
	ctor: '::',
	_0: _elm_lang$core$Native_Utils.chr('a'),
	_1: {
		ctor: '::',
		_0: _elm_lang$core$Native_Utils.chr('2'),
		_1: {
			ctor: '::',
			_0: _elm_lang$core$Native_Utils.chr('y'),
			_1: {
				ctor: '::',
				_0: _elm_lang$core$Native_Utils.chr('q'),
				_1: {
					ctor: '::',
					_0: _elm_lang$core$Native_Utils.chr('j'),
					_1: {
						ctor: '::',
						_0: _elm_lang$core$Native_Utils.chr('b'),
						_1: {
							ctor: '::',
							_0: _elm_lang$core$Native_Utils.chr('k'),
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Native_Utils.chr('c'),
								_1: {
									ctor: '::',
									_0: _elm_lang$core$Native_Utils.chr('1'),
									_1: {
										ctor: '::',
										_0: _elm_lang$core$Native_Utils.chr('n'),
										_1: {
											ctor: '::',
											_0: _elm_lang$core$Native_Utils.chr('o'),
											_1: {
												ctor: '::',
												_0: _elm_lang$core$Native_Utils.chr('x'),
												_1: {
													ctor: '::',
													_0: _elm_lang$core$Native_Utils.chr('v'),
													_1: {
														ctor: '::',
														_0: _elm_lang$core$Native_Utils.chr('d'),
														_1: {
															ctor: '::',
															_0: _elm_lang$core$Native_Utils.chr('4'),
															_1: {
																ctor: '::',
																_0: _elm_lang$core$Native_Utils.chr('e'),
																_1: {
																	ctor: '::',
																	_0: _elm_lang$core$Native_Utils.chr('f'),
																	_1: {
																		ctor: '::',
																		_0: _elm_lang$core$Native_Utils.chr('u'),
																		_1: {
																			ctor: '::',
																			_0: _elm_lang$core$Native_Utils.chr('h'),
																			_1: {
																				ctor: '::',
																				_0: _elm_lang$core$Native_Utils.chr('3'),
																				_1: {
																					ctor: '::',
																					_0: _elm_lang$core$Native_Utils.chr('8'),
																					_1: {
																						ctor: '::',
																						_0: _elm_lang$core$Native_Utils.chr('i'),
																						_1: {
																							ctor: '::',
																							_0: _elm_lang$core$Native_Utils.chr('5'),
																							_1: {
																								ctor: '::',
																								_0: _elm_lang$core$Native_Utils.chr('t'),
																								_1: {
																									ctor: '::',
																									_0: _elm_lang$core$Native_Utils.chr('l'),
																									_1: {
																										ctor: '::',
																										_0: _elm_lang$core$Native_Utils.chr('m'),
																										_1: {
																											ctor: '::',
																											_0: _elm_lang$core$Native_Utils.chr('p'),
																											_1: {
																												ctor: '::',
																												_0: _elm_lang$core$Native_Utils.chr('r'),
																												_1: {
																													ctor: '::',
																													_0: _elm_lang$core$Native_Utils.chr('z'),
																													_1: {
																														ctor: '::',
																														_0: _elm_lang$core$Native_Utils.chr('7'),
																														_1: {
																															ctor: '::',
																															_0: _elm_lang$core$Native_Utils.chr('6'),
																															_1: {
																																ctor: '::',
																																_0: _elm_lang$core$Native_Utils.chr('g'),
																																_1: {
																																	ctor: '::',
																																	_0: _elm_lang$core$Native_Utils.chr('s'),
																																	_1: {
																																		ctor: '::',
																																		_0: _elm_lang$core$Native_Utils.chr('w'),
																																		_1: {ctor: '[]'}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _user$project$Strengths$strengthDict = _elm_lang$core$Dict$fromList(
	{
		ctor: '::',
		_0: {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.chr('a'),
			_1: {
				id: _elm_lang$core$Native_Utils.chr('a'),
				name: 'Achiever',
				info: 'People strong in the Achiever theme have a great deal of stamina and work hard. They take great satisfaction from being busy and productive.'
			}
		},
		_1: {
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.chr('2'),
				_1: {
					id: _elm_lang$core$Native_Utils.chr('2'),
					name: 'Activator',
					info: 'People strong in the Activator theme can make things happen by turning thoughts into action. They are often impatient.'
				}
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.chr('y'),
					_1: {
						id: _elm_lang$core$Native_Utils.chr('y'),
						name: 'Adaptability',
						info: 'People strong in the Adaptability theme prefer to \"go with the flow.\" They tend to be \"now\" people who take things as they come and discover the future one day at a time.'
					}
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.chr('q'),
						_1: {
							id: _elm_lang$core$Native_Utils.chr('q'),
							name: 'Analytical',
							info: 'People strong in the Analytical theme search for reasons and causes. They have the ability to think about all the factors that might affect a situation.'
						}
					},
					_1: {
						ctor: '::',
						_0: {
							ctor: '_Tuple2',
							_0: _elm_lang$core$Native_Utils.chr('j'),
							_1: {
								id: _elm_lang$core$Native_Utils.chr('j'),
								name: 'Arranger',
								info: 'People strong in the Arranger theme can organize, but they also have a flexibility that complements this ability. They like to figure out how all of the pieces and resources can be arranged for maximum productivity.'
							}
						},
						_1: {
							ctor: '::',
							_0: {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Native_Utils.chr('b'),
								_1: {
									id: _elm_lang$core$Native_Utils.chr('b'),
									name: 'Belief',
									info: 'People strong in the Belief theme have certain core values that are unchanging. Out of these values emerges a defined purpose for their life.'
								}
							},
							_1: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Native_Utils.chr('k'),
									_1: {
										id: _elm_lang$core$Native_Utils.chr('k'),
										name: 'Command',
										info: 'People strong in the Command theme have presence. They can take control of a situation and make decisions.'
									}
								},
								_1: {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: _elm_lang$core$Native_Utils.chr('c'),
										_1: {
											id: _elm_lang$core$Native_Utils.chr('c'),
											name: 'Communication',
											info: 'People strong in the Communication theme generally find it easy to put their thoughts into words. They are good conversationalists and presenters.'
										}
									},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: _elm_lang$core$Native_Utils.chr('1'),
											_1: {
												id: _elm_lang$core$Native_Utils.chr('1'),
												name: 'Competition',
												info: 'People strong in the Competition theme measure their progress against the performance of others. They strive to win first place and revel in contests.'
											}
										},
										_1: {
											ctor: '::',
											_0: {
												ctor: '_Tuple2',
												_0: _elm_lang$core$Native_Utils.chr('n'),
												_1: {
													id: _elm_lang$core$Native_Utils.chr('n'),
													name: 'Connectedness',
													info: 'People strong in the Connectedness theme have faith in the links between all things. They believe there are few coincidences and that almost every event has a reason.'
												}
											},
											_1: {
												ctor: '::',
												_0: {
													ctor: '_Tuple2',
													_0: _elm_lang$core$Native_Utils.chr('o'),
													_1: {
														id: _elm_lang$core$Native_Utils.chr('o'),
														name: 'Consistency',
														info: 'People strong in the Consistency theme are keenly aware of the need to treat people the same. They try to treat everyone in the world fairly by setting up clear rules and adhering to them.'
													}
												},
												_1: {
													ctor: '::',
													_0: {
														ctor: '_Tuple2',
														_0: _elm_lang$core$Native_Utils.chr('x'),
														_1: {
															id: _elm_lang$core$Native_Utils.chr('x'),
															name: 'Context',
															info: 'People strong in the Context theme enjoy thinking about the past. They understand the present by researching its history.'
														}
													},
													_1: {
														ctor: '::',
														_0: {
															ctor: '_Tuple2',
															_0: _elm_lang$core$Native_Utils.chr('v'),
															_1: {
																id: _elm_lang$core$Native_Utils.chr('v'),
																name: 'Deliberative',
																info: 'People strong in the Deliberative theme are best described by the serious care they take in making decisions or choices. They anticipate the obstacles.'
															}
														},
														_1: {
															ctor: '::',
															_0: {
																ctor: '_Tuple2',
																_0: _elm_lang$core$Native_Utils.chr('d'),
																_1: {
																	id: _elm_lang$core$Native_Utils.chr('d'),
																	name: 'Developer',
																	info: 'People strong in the Developer theme recognize and cultivate the potential in others. They spot the signs of each small improvement and derive satisfaction from these improvements.'
																}
															},
															_1: {
																ctor: '::',
																_0: {
																	ctor: '_Tuple2',
																	_0: _elm_lang$core$Native_Utils.chr('4'),
																	_1: {
																		id: _elm_lang$core$Native_Utils.chr('4'),
																		name: 'Discipline',
																		info: 'People strong in the Discipline theme enjoy routine and structure. Their world is best described by the order they create.'
																	}
																},
																_1: {
																	ctor: '::',
																	_0: {
																		ctor: '_Tuple2',
																		_0: _elm_lang$core$Native_Utils.chr('e'),
																		_1: {
																			id: _elm_lang$core$Native_Utils.chr('e'),
																			name: 'Empathy',
																			info: 'People strong in the Empathy theme can sense the feelings of other people by imagining themselves in others\' lives or others\' situations.'
																		}
																	},
																	_1: {
																		ctor: '::',
																		_0: {
																			ctor: '_Tuple2',
																			_0: _elm_lang$core$Native_Utils.chr('f'),
																			_1: {
																				id: _elm_lang$core$Native_Utils.chr('f'),
																				name: 'Focus',
																				info: 'People strong in the Focus theme can take a direction, follow through, and make the corrections necessary to stay on track. They prioritize, then act.'
																			}
																		},
																		_1: {
																			ctor: '::',
																			_0: {
																				ctor: '_Tuple2',
																				_0: _elm_lang$core$Native_Utils.chr('u'),
																				_1: {
																					id: _elm_lang$core$Native_Utils.chr('u'),
																					name: 'Futuristic',
																					info: 'People strong in the Futuristic theme are inspired by the future and what could be. They inspire others with their visions of the future.'
																				}
																			},
																			_1: {
																				ctor: '::',
																				_0: {
																					ctor: '_Tuple2',
																					_0: _elm_lang$core$Native_Utils.chr('h'),
																					_1: {
																						id: _elm_lang$core$Native_Utils.chr('h'),
																						name: 'Harmony',
																						info: 'People strong in the Harmony theme look for consensus. They don\'t enjoy conflict; rather, they seek areas of agreement.'
																					}
																				},
																				_1: {
																					ctor: '::',
																					_0: {
																						ctor: '_Tuple2',
																						_0: _elm_lang$core$Native_Utils.chr('3'),
																						_1: {
																							id: _elm_lang$core$Native_Utils.chr('3'),
																							name: 'Ideation',
																							info: 'People strong in the Ideation theme are fascinated by ideas. They are able to find connections between seemingly disparate phenomena.'
																						}
																					},
																					_1: {
																						ctor: '::',
																						_0: {
																							ctor: '_Tuple2',
																							_0: _elm_lang$core$Native_Utils.chr('8'),
																							_1: {
																								id: _elm_lang$core$Native_Utils.chr('8'),
																								name: 'Includer',
																								info: 'People strong in the Includer theme are accepting of others. They show awareness of those who feel left out, and make an effort to include them.'
																							}
																						},
																						_1: {
																							ctor: '::',
																							_0: {
																								ctor: '_Tuple2',
																								_0: _elm_lang$core$Native_Utils.chr('i'),
																								_1: {
																									id: _elm_lang$core$Native_Utils.chr('i'),
																									name: 'Individualization',
																									info: 'People strong in the Individualization theme are intrigued with the unique qualities of each person. They have a gift for figuring out how people who are different can work together productively.'
																								}
																							},
																							_1: {
																								ctor: '::',
																								_0: {
																									ctor: '_Tuple2',
																									_0: _elm_lang$core$Native_Utils.chr('5'),
																									_1: {
																										id: _elm_lang$core$Native_Utils.chr('5'),
																										name: 'Input',
																										info: 'People strong in the Input theme have a craving to know more. Often they like to collect and archive all kinds of information.'
																									}
																								},
																								_1: {
																									ctor: '::',
																									_0: {
																										ctor: '_Tuple2',
																										_0: _elm_lang$core$Native_Utils.chr('t'),
																										_1: {
																											id: _elm_lang$core$Native_Utils.chr('t'),
																											name: 'Intellection',
																											info: 'People strong in the Intellection theme are characterized by their intellectual activity. They are introspective and appreciate intellectual discussions.'
																										}
																									},
																									_1: {
																										ctor: '::',
																										_0: {
																											ctor: '_Tuple2',
																											_0: _elm_lang$core$Native_Utils.chr('l'),
																											_1: {
																												id: _elm_lang$core$Native_Utils.chr('l'),
																												name: 'Learner',
																												info: 'People strong in the Learner theme have a great desire to learn and want to continuously improve. In particular, the process of learning, rather than the outcome, excites them.'
																											}
																										},
																										_1: {
																											ctor: '::',
																											_0: {
																												ctor: '_Tuple2',
																												_0: _elm_lang$core$Native_Utils.chr('m'),
																												_1: {
																													id: _elm_lang$core$Native_Utils.chr('m'),
																													name: 'Maximizer',
																													info: 'People strong in the Maximizer theme focus on strengths as a way to stimulate personal and group excellence. They seek to transform something strong into something superb.'
																												}
																											},
																											_1: {
																												ctor: '::',
																												_0: {
																													ctor: '_Tuple2',
																													_0: _elm_lang$core$Native_Utils.chr('p'),
																													_1: {
																														id: _elm_lang$core$Native_Utils.chr('p'),
																														name: 'Positivity',
																														info: 'People strong in the Positivity theme have an enthusiasm that is contagious. They are upbeat and can get others excited about what they are going to do.'
																													}
																												},
																												_1: {
																													ctor: '::',
																													_0: {
																														ctor: '_Tuple2',
																														_0: _elm_lang$core$Native_Utils.chr('r'),
																														_1: {
																															id: _elm_lang$core$Native_Utils.chr('r'),
																															name: 'Relator',
																															info: 'People who are strong in the Relator theme enjoy close relationships with others. They find deep satisfaction in working hard with friends to achieve a goal.'
																														}
																													},
																													_1: {
																														ctor: '::',
																														_0: {
																															ctor: '_Tuple2',
																															_0: _elm_lang$core$Native_Utils.chr('z'),
																															_1: {
																																id: _elm_lang$core$Native_Utils.chr('z'),
																																name: 'Responsibility',
																																info: 'People strong in the Responsibility theme take psychological ownership of what they say they will do. They are committed to stable values such as honesty and loyalty.'
																															}
																														},
																														_1: {
																															ctor: '::',
																															_0: {
																																ctor: '_Tuple2',
																																_0: _elm_lang$core$Native_Utils.chr('7'),
																																_1: {
																																	id: _elm_lang$core$Native_Utils.chr('7'),
																																	name: 'Restorative',
																																	info: 'People strong in the Restorative theme are adept at dealing with problems. They are good at figuring out what is wrong and resolving it.'
																																}
																															},
																															_1: {
																																ctor: '::',
																																_0: {
																																	ctor: '_Tuple2',
																																	_0: _elm_lang$core$Native_Utils.chr('6'),
																																	_1: {
																																		id: _elm_lang$core$Native_Utils.chr('6'),
																																		name: 'Self-Assurance',
																																		info: 'People strong in the Self-Assurance theme feel confident in their ability to manage their own lives. They possess an inner compass that gives them confidence that their decisions are right.'
																																	}
																																},
																																_1: {
																																	ctor: '::',
																																	_0: {
																																		ctor: '_Tuple2',
																																		_0: _elm_lang$core$Native_Utils.chr('g'),
																																		_1: {
																																			id: _elm_lang$core$Native_Utils.chr('g'),
																																			name: 'Significance',
																																			info: 'People strong in the Significance theme want to be very important in the eyes of others. They are independent and want to be recognized.'
																																		}
																																	},
																																	_1: {
																																		ctor: '::',
																																		_0: {
																																			ctor: '_Tuple2',
																																			_0: _elm_lang$core$Native_Utils.chr('s'),
																																			_1: {
																																				id: _elm_lang$core$Native_Utils.chr('s'),
																																				name: 'Strategic',
																																				info: 'People strong in the Strategic theme create alternative ways to proceed. Faced with any given scenario, they can quickly spot the relevant patterns and issues.'
																																			}
																																		},
																																		_1: {
																																			ctor: '::',
																																			_0: {
																																				ctor: '_Tuple2',
																																				_0: _elm_lang$core$Native_Utils.chr('w'),
																																				_1: {
																																					id: _elm_lang$core$Native_Utils.chr('w'),
																																					name: 'Woo',
																																					info: 'People strong in the Woo theme love the challenge of meeting new people and winning them over. They derive satisfaction from breaking the ice and making a connection with another person.'
																																				}
																																			},
																																			_1: {ctor: '[]'}
																																		}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	});
var _user$project$Strengths$getStrengthFromCode = function (code) {
	var _p0 = A2(_elm_lang$core$Dict$get, code, _user$project$Strengths$strengthDict);
	if (_p0.ctor === 'Nothing') {
		return _elm_lang$core$Result$Err(
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(code),
				' is not a valid strength'));
	} else {
		return _elm_lang$core$Result$Ok(_p0._0);
	}
};
var _user$project$Strengths$getStrengthNameFromCode = function (code) {
	var _p1 = A2(_elm_lang$core$Dict$get, code, _user$project$Strengths$strengthDict);
	if (_p1.ctor === 'Nothing') {
		return '';
	} else {
		return _p1._0.name;
	}
};
var _user$project$Strengths$getStrengthNameListFromCodex = function (maybeCodex) {
	var _p2 = maybeCodex;
	if (_p2.ctor === 'Nothing') {
		return {ctor: '[]'};
	} else {
		return A2(
			_elm_lang$core$List$map,
			_user$project$Strengths$getStrengthNameFromCode,
			_elm_lang$core$String$toList(_p2._0));
	}
};
var _user$project$Strengths$strengthNameList = {
	ctor: '::',
	_0: 'achiever',
	_1: {
		ctor: '::',
		_0: 'activator',
		_1: {
			ctor: '::',
			_0: 'adaptability',
			_1: {
				ctor: '::',
				_0: 'analytical',
				_1: {
					ctor: '::',
					_0: 'arranger',
					_1: {
						ctor: '::',
						_0: 'belief',
						_1: {
							ctor: '::',
							_0: 'command',
							_1: {
								ctor: '::',
								_0: 'communication',
								_1: {
									ctor: '::',
									_0: 'competition',
									_1: {
										ctor: '::',
										_0: 'connectedness',
										_1: {
											ctor: '::',
											_0: 'consistency',
											_1: {
												ctor: '::',
												_0: 'context',
												_1: {
													ctor: '::',
													_0: 'deliberative',
													_1: {
														ctor: '::',
														_0: 'developer',
														_1: {
															ctor: '::',
															_0: 'discipline',
															_1: {
																ctor: '::',
																_0: 'empathy',
																_1: {
																	ctor: '::',
																	_0: 'focus',
																	_1: {
																		ctor: '::',
																		_0: 'futuristic',
																		_1: {
																			ctor: '::',
																			_0: 'harmony',
																			_1: {
																				ctor: '::',
																				_0: 'ideation',
																				_1: {
																					ctor: '::',
																					_0: 'includer',
																					_1: {
																						ctor: '::',
																						_0: 'individualization',
																						_1: {
																							ctor: '::',
																							_0: 'input',
																							_1: {
																								ctor: '::',
																								_0: 'intellection',
																								_1: {
																									ctor: '::',
																									_0: 'learner',
																									_1: {
																										ctor: '::',
																										_0: 'maximizer',
																										_1: {
																											ctor: '::',
																											_0: 'positivity',
																											_1: {
																												ctor: '::',
																												_0: 'relator',
																												_1: {
																													ctor: '::',
																													_0: 'responsibility',
																													_1: {
																														ctor: '::',
																														_0: 'restorative',
																														_1: {
																															ctor: '::',
																															_0: 'self-assurance',
																															_1: {
																																ctor: '::',
																																_0: 'significance',
																																_1: {
																																	ctor: '::',
																																	_0: 'strategic',
																																	_1: {
																																		ctor: '::',
																																		_0: 'woo',
																																		_1: {ctor: '[]'}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _user$project$Strengths$isStrengthValid = function (text) {
	return A2(
		_elm_lang$core$List$member,
		_user$project$Strengths$clean(text),
		_user$project$Strengths$strengthNameList) ? _elm_lang$core$Result$Ok(text) : _elm_lang$core$Result$Err(
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(text),
			' is not a valid strength'));
};
var _user$project$Strengths$strengthList = {
	ctor: '::',
	_0: {
		id: _elm_lang$core$Native_Utils.chr('a'),
		name: 'Achiever',
		info: 'People strong in the Achiever theme have a great deal of stamina and work hard. They take great satisfaction from being busy and productive.'
	},
	_1: {
		ctor: '::',
		_0: {
			id: _elm_lang$core$Native_Utils.chr('2'),
			name: 'Activator',
			info: 'People strong in the Activator theme can make things happen by turning thoughts into action. They are often impatient.'
		},
		_1: {
			ctor: '::',
			_0: {
				id: _elm_lang$core$Native_Utils.chr('y'),
				name: 'Adaptability',
				info: 'People strong in the Adaptability theme prefer to \"go with the flow.\" They tend to be \"now\" people who take things as they come and discover the future one day at a time.'
			},
			_1: {
				ctor: '::',
				_0: {
					id: _elm_lang$core$Native_Utils.chr('q'),
					name: 'Analytical',
					info: 'People strong in the Analytical theme search for reasons and causes. They have the ability to think about all the factors that might affect a situation.'
				},
				_1: {
					ctor: '::',
					_0: {
						id: _elm_lang$core$Native_Utils.chr('j'),
						name: 'Arranger',
						info: 'People strong in the Arranger theme can organize, but they also have a flexibility that complements this ability. They like to figure out how all of the pieces and resources can be arranged for maximum productivity.'
					},
					_1: {
						ctor: '::',
						_0: {
							id: _elm_lang$core$Native_Utils.chr('b'),
							name: 'Belief',
							info: 'People strong in the Belief theme have certain core values that are unchanging. Out of these values emerges a defined purpose for their life.'
						},
						_1: {
							ctor: '::',
							_0: {
								id: _elm_lang$core$Native_Utils.chr('k'),
								name: 'Command',
								info: 'People strong in the Command theme have presence. They can take control of a situation and make decisions.'
							},
							_1: {
								ctor: '::',
								_0: {
									id: _elm_lang$core$Native_Utils.chr('c'),
									name: 'Communication',
									info: 'People strong in the Communication theme generally find it easy to put their thoughts into words. They are good conversationalists and presenters.'
								},
								_1: {
									ctor: '::',
									_0: {
										id: _elm_lang$core$Native_Utils.chr('1'),
										name: 'Competition',
										info: 'People strong in the Competition theme measure their progress against the performance of others. They strive to win first place and revel in contests.'
									},
									_1: {
										ctor: '::',
										_0: {
											id: _elm_lang$core$Native_Utils.chr('n'),
											name: 'Connectedness',
											info: 'People strong in the Connectedness theme have faith in the links between all things. They believe there are few coincidences and that almost every event has a reason.'
										},
										_1: {
											ctor: '::',
											_0: {
												id: _elm_lang$core$Native_Utils.chr('o'),
												name: 'Consistency',
												info: 'People strong in the Consistency theme are keenly aware of the need to treat people the same. They try to treat everyone in the world fairly by setting up clear rules and adhering to them.'
											},
											_1: {
												ctor: '::',
												_0: {
													id: _elm_lang$core$Native_Utils.chr('x'),
													name: 'Context',
													info: 'People strong in the Context theme enjoy thinking about the past. They understand the present by researching its history.'
												},
												_1: {
													ctor: '::',
													_0: {
														id: _elm_lang$core$Native_Utils.chr('v'),
														name: 'Deliberative',
														info: 'People strong in the Deliberative theme are best described by the serious care they take in making decisions or choices. They anticipate the obstacles.'
													},
													_1: {
														ctor: '::',
														_0: {
															id: _elm_lang$core$Native_Utils.chr('d'),
															name: 'Developer',
															info: 'People strong in the Developer theme recognize and cultivate the potential in others. They spot the signs of each small improvement and derive satisfaction from these improvements.'
														},
														_1: {
															ctor: '::',
															_0: {
																id: _elm_lang$core$Native_Utils.chr('4'),
																name: 'Discipline',
																info: 'People strong in the Discipline theme enjoy routine and structure. Their world is best described by the order they create.'
															},
															_1: {
																ctor: '::',
																_0: {
																	id: _elm_lang$core$Native_Utils.chr('e'),
																	name: 'Empathy',
																	info: 'People strong in the Empathy theme can sense the feelings of other people by imagining themselves in others\' lives or others\' situations.'
																},
																_1: {
																	ctor: '::',
																	_0: {
																		id: _elm_lang$core$Native_Utils.chr('f'),
																		name: 'Focus',
																		info: 'People strong in the Focus theme can take a direction, follow through, and make the corrections necessary to stay on track. They prioritize, then act.'
																	},
																	_1: {
																		ctor: '::',
																		_0: {
																			id: _elm_lang$core$Native_Utils.chr('u'),
																			name: 'Futuristic',
																			info: 'People strong in the Futuristic theme are inspired by the future and what could be. They inspire others with their visions of the future.'
																		},
																		_1: {
																			ctor: '::',
																			_0: {
																				id: _elm_lang$core$Native_Utils.chr('h'),
																				name: 'Harmony',
																				info: 'People strong in the Harmony theme look for consensus. They don\'t enjoy conflict; rather, they seek areas of agreement.'
																			},
																			_1: {
																				ctor: '::',
																				_0: {
																					id: _elm_lang$core$Native_Utils.chr('3'),
																					name: 'Ideation',
																					info: 'People strong in the Ideation theme are fascinated by ideas. They are able to find connections between seemingly disparate phenomena.'
																				},
																				_1: {
																					ctor: '::',
																					_0: {
																						id: _elm_lang$core$Native_Utils.chr('8'),
																						name: 'Includer',
																						info: 'People strong in the Includer theme are accepting of others. They show awareness of those who feel left out, and make an effort to include them.'
																					},
																					_1: {
																						ctor: '::',
																						_0: {
																							id: _elm_lang$core$Native_Utils.chr('i'),
																							name: 'Individualization',
																							info: 'People strong in the Individualization theme are intrigued with the unique qualities of each person. They have a gift for figuring out how people who are different can work together productively.'
																						},
																						_1: {
																							ctor: '::',
																							_0: {
																								id: _elm_lang$core$Native_Utils.chr('5'),
																								name: 'Input',
																								info: 'People strong in the Input theme have a craving to know more. Often they like to collect and archive all kinds of information.'
																							},
																							_1: {
																								ctor: '::',
																								_0: {
																									id: _elm_lang$core$Native_Utils.chr('t'),
																									name: 'Intellection',
																									info: 'People strong in the Intellection theme are characterized by their intellectual activity. They are introspective and appreciate intellectual discussions.'
																								},
																								_1: {
																									ctor: '::',
																									_0: {
																										id: _elm_lang$core$Native_Utils.chr('l'),
																										name: 'Learner',
																										info: 'People strong in the Learner theme have a great desire to learn and want to continuously improve. In particular, the process of learning, rather than the outcome, excites them.'
																									},
																									_1: {
																										ctor: '::',
																										_0: {
																											id: _elm_lang$core$Native_Utils.chr('m'),
																											name: 'Maximizer',
																											info: 'People strong in the Maximizer theme focus on strengths as a way to stimulate personal and group excellence. They seek to transform something strong into something superb.'
																										},
																										_1: {
																											ctor: '::',
																											_0: {
																												id: _elm_lang$core$Native_Utils.chr('p'),
																												name: 'Positivity',
																												info: 'People strong in the Positivity theme have an enthusiasm that is contagious. They are upbeat and can get others excited about what they are going to do.'
																											},
																											_1: {
																												ctor: '::',
																												_0: {
																													id: _elm_lang$core$Native_Utils.chr('r'),
																													name: 'Relator',
																													info: 'People who are strong in the Relator theme enjoy close relationships with others. They find deep satisfaction in working hard with friends to achieve a goal.'
																												},
																												_1: {
																													ctor: '::',
																													_0: {
																														id: _elm_lang$core$Native_Utils.chr('z'),
																														name: 'Responsibility',
																														info: 'People strong in the Responsibility theme take psychological ownership of what they say they will do. They are committed to stable values such as honesty and loyalty.'
																													},
																													_1: {
																														ctor: '::',
																														_0: {
																															id: _elm_lang$core$Native_Utils.chr('7'),
																															name: 'Restorative',
																															info: 'People strong in the Restorative theme are adept at dealing with problems. They are good at figuring out what is wrong and resolving it.'
																														},
																														_1: {
																															ctor: '::',
																															_0: {
																																id: _elm_lang$core$Native_Utils.chr('6'),
																																name: 'Self-Assurance',
																																info: 'People strong in the Self-Assurance theme feel confident in their ability to manage their own lives. They possess an inner compass that gives them confidence that their decisions are right.'
																															},
																															_1: {
																																ctor: '::',
																																_0: {
																																	id: _elm_lang$core$Native_Utils.chr('g'),
																																	name: 'Significance',
																																	info: 'People strong in the Significance theme want to be very important in the eyes of others. They are independent and want to be recognized.'
																																},
																																_1: {
																																	ctor: '::',
																																	_0: {
																																		id: _elm_lang$core$Native_Utils.chr('s'),
																																		name: 'Strategic',
																																		info: 'People strong in the Strategic theme create alternative ways to proceed. Faced with any given scenario, they can quickly spot the relevant patterns and issues.'
																																	},
																																	_1: {
																																		ctor: '::',
																																		_0: {
																																			id: _elm_lang$core$Native_Utils.chr('w'),
																																			name: 'Woo',
																																			info: 'People strong in the Woo theme love the challenge of meeting new people and winning them over. They derive satisfaction from breaking the ice and making a connection with another person.'
																																		},
																																		_1: {ctor: '[]'}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _user$project$Strengths$getStrengthFromName = function (name) {
	var strength = A2(
		_elm_lang$core$List$filter,
		function (s) {
			return _elm_lang$core$Native_Utils.eq(
				_user$project$Strengths$clean(s.name),
				_user$project$Strengths$clean(name));
		},
		_user$project$Strengths$strengthList);
	var result = A2(
		_elm_lang$core$Result$fromMaybe,
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(name),
			' could not be found'),
		_elm_lang$core$List$head(strength));
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$List$length(strength),
		1) ? result : _elm_lang$core$Result$Err(
		A2(
			_elm_lang$core$Basics_ops['++'],
			_elm_lang$core$Basics$toString(name),
			' is not a valid strength'));
};
var _user$project$Strengths$initModel = {strengths: _user$project$Strengths$strengthList, codes: _user$project$Strengths$codeList};
var _user$project$Strengths$Model = F2(
	function (a, b) {
		return {strengths: a, codes: b};
	});
var _user$project$Strengths$Strength = F3(
	function (a, b, c) {
		return {id: a, name: b, info: c};
	});

var _user$project$StrengthField$publishError = function (model) {
	var result = _user$project$Strengths$getStrengthFromName(model.field);
	var _p0 = result;
	if (_p0.ctor === 'Err') {
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{
					validation: {
						ctor: '_Tuple2',
						_0: false,
						_1: _elm_lang$core$Maybe$Just(_p0._0)
					}
				}),
			_1: _elm_lang$core$Platform_Cmd$none
		};
	} else {
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{
					validation: {
						ctor: '_Tuple2',
						_0: true,
						_1: _elm_lang$core$Maybe$Just(
							_elm_lang$core$String$fromChar(_p0._0.id))
					}
				}),
			_1: _elm_lang$core$Platform_Cmd$none
		};
	}
};
var _user$project$StrengthField$isInputValid = function (text) {
	var result = _user$project$Strengths$isStrengthValid(text);
	var _p1 = result;
	if (_p1.ctor === 'Err') {
		return {ctor: '_Tuple2', _0: false, _1: _elm_lang$core$Maybe$Nothing};
	} else {
		return {ctor: '_Tuple2', _0: true, _1: _elm_lang$core$Maybe$Nothing};
	}
};
var _user$project$StrengthField$update = F2(
	function (msg, model) {
		var _p2 = msg;
		switch (_p2.ctor) {
			case 'Input':
				var _p3 = _p2._0;
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							field: _p3,
							validation: _user$project$StrengthField$isInputValid(_p3)
						}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Validate':
				return _user$project$StrengthField$publishError(model);
			default:
				return A2(_MichaelCombs28$elm_mdl$Material$update, _p2._0, model);
		}
	});
var _user$project$StrengthField$init = {
	ctor: '_Tuple2',
	_0: {
		field: '',
		validation: {ctor: '_Tuple2', _0: false, _1: _elm_lang$core$Maybe$Nothing},
		mdl: _MichaelCombs28$elm_mdl$Material$model
	},
	_1: _elm_lang$core$Platform_Cmd$none
};
var _user$project$StrengthField$initWith = function (code) {
	var strengthResult = _user$project$Strengths$getStrengthFromCode(code);
	var _p4 = strengthResult;
	if (_p4.ctor === 'Ok') {
		return {
			ctor: '_Tuple2',
			_0: {
				field: _p4._0.name,
				validation: {
					ctor: '_Tuple2',
					_0: true,
					_1: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Basics$toString(code))
				},
				mdl: _MichaelCombs28$elm_mdl$Material$model
			},
			_1: _elm_lang$core$Platform_Cmd$none
		};
	} else {
		return _user$project$StrengthField$init;
	}
};
var _user$project$StrengthField$Model = F3(
	function (a, b, c) {
		return {field: a, validation: b, mdl: c};
	});
var _user$project$StrengthField$Mdl = function (a) {
	return {ctor: 'Mdl', _0: a};
};
var _user$project$StrengthField$Validate = {ctor: 'Validate'};
var _user$project$StrengthField$Input = function (a) {
	return {ctor: 'Input', _0: a};
};
var _user$project$StrengthField$view = F2(
	function (model, ordinal) {
		var error = function () {
			var _p5 = _elm_lang$core$Tuple$second(model.validation);
			if (_p5.ctor === 'Just') {
				return _MichaelCombs28$elm_mdl$Material_Textfield$error(_p5._0);
			} else {
				return _MichaelCombs28$elm_mdl$Material_Options$nop;
			}
		}();
		return A4(
			_MichaelCombs28$elm_mdl$Material_Textfield$render,
			_user$project$StrengthField$Mdl,
			{
				ctor: '::',
				_0: 0,
				_1: {ctor: '[]'}
			},
			model.mdl,
			{
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Textfield$label(
					A2(_elm_lang$core$Basics_ops['++'], ordinal, ' Strength')),
				_1: {
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Textfield$floatingLabel,
					_1: {
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Textfield$onInput(_user$project$StrengthField$Input),
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Textfield$value(model.field),
							_1: {
								ctor: '::',
								_0: (!_elm_lang$core$Tuple$first(model.validation)) ? error : _MichaelCombs28$elm_mdl$Material_Options$nop,
								_1: {
									ctor: '::',
									_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'width', '100%'),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			});
	});

var _user$project$PersonDetail$subscriptions = function (model) {
	return _elm_lang$core$Platform_Sub$none;
};
var _user$project$PersonDetail$getOrdinalNumber = function (number) {
	var _p0 = number;
	switch (_p0) {
		case 0:
			return 'First';
		case 1:
			return 'Second';
		case 2:
			return 'Third';
		case 3:
			return 'Fourth';
		case 4:
			return 'Fifth';
		default:
			return '';
	}
};
var _user$project$PersonDetail_ops = _user$project$PersonDetail_ops || {};
_user$project$PersonDetail_ops['=>'] = F2(
	function (v0, v1) {
		return {ctor: '_Tuple2', _0: v0, _1: v1};
	});
var _user$project$PersonDetail$injectStrength = function (code) {
	var _p1 = _user$project$StrengthField$initWith(code);
	var fieldModel = _p1._0;
	var cmd = _p1._1;
	return fieldModel;
};
var _user$project$PersonDetail$injectAllStrengths = function (strengthCode) {
	var _p2 = strengthCode;
	if (_p2.ctor === 'Nothing') {
		var _p3 = _user$project$StrengthField$init;
		var fieldModel = _p3._0;
		var cmd = _p3._1;
		return _elm_lang$core$Dict$fromList(
			A2(
				_elm_lang$core$List$indexedMap,
				F2(
					function (v0, v1) {
						return {ctor: '_Tuple2', _0: v0, _1: v1};
					}),
				A2(_elm_lang$core$List$repeat, 5, fieldModel)));
	} else {
		var codes = A2(
			_elm_lang$core$List$map,
			_user$project$PersonDetail$injectStrength,
			_elm_lang$core$String$toList(_p2._0));
		var index = A2(_elm_lang$core$List$range, 0, 4);
		var indexWithCodes = A3(
			_elm_lang$core$List$map2,
			F2(
				function (v0, v1) {
					return {ctor: '_Tuple2', _0: v0, _1: v1};
				}),
			index,
			codes);
		return _elm_lang$core$Dict$fromList(indexWithCodes);
	}
};
var _user$project$PersonDetail$getCodes = function (fields) {
	var extractCode = function (strength) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			'',
			_elm_lang$core$Tuple$second(strength.validation));
	};
	var calculate = F3(
		function (index, strength, result) {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				result,
				extractCode(strength));
		});
	return A3(_elm_lang$core$Dict$foldl, calculate, '', fields);
};
var _user$project$PersonDetail$isFieldValid = function (_p4) {
	var _p5 = _p4;
	return _elm_lang$core$Tuple$first(_p5._1.validation);
};
var _user$project$PersonDetail$isAllFieldsValid = function (fields) {
	return A2(
		_elm_lang$core$List$all,
		_user$project$PersonDetail$isFieldValid,
		_elm_lang$core$Dict$toList(fields));
};
var _user$project$PersonDetail$extractAllCodes = function (fields) {
	return _user$project$PersonDetail$isAllFieldsValid(fields) ? _elm_lang$core$Maybe$Just(
		_user$project$PersonDetail$getCodes(fields)) : _elm_lang$core$Maybe$Nothing;
};
var _user$project$PersonDetail$validateAllFields = function (model) {
	var validateFieldModel = function (strength) {
		var _p6 = A2(_user$project$StrengthField$update, _user$project$StrengthField$Validate, strength);
		var fieldModel = _p6._0;
		var cmd = _p6._1;
		return fieldModel;
	};
	return A2(
		_elm_lang$core$Dict$map,
		F2(
			function (_p7, strength) {
				return validateFieldModel(strength);
			}),
		model.strengthInputs);
};
var _user$project$PersonDetail$save = function (model) {
	var person = model.person;
	var newFieldModels = _user$project$PersonDetail$validateAllFields(model);
	var newStrengthsCode = _user$project$PersonDetail$extractAllCodes(newFieldModels);
	var newPerson = _elm_lang$core$Native_Utils.update(
		person,
		{strengths: newStrengthsCode});
	var cmds = _user$project$PersonDetail$isAllFieldsValid(newFieldModels) ? _elm_lang$navigation$Navigation$newUrl('/') : _elm_lang$core$Platform_Cmd$none;
	return {
		ctor: '_Tuple2',
		_0: _elm_lang$core$Native_Utils.update(
			model,
			{person: newPerson, strengthInputs: newFieldModels}),
		_1: cmds
	};
};
var _user$project$PersonDetail$update = F2(
	function (msg, model) {
		var _p8 = msg;
		switch (_p8.ctor) {
			case 'NameInput':
				var person = model.person;
				var newPerson = _elm_lang$core$Native_Utils.update(
					person,
					{name: _p8._0});
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{person: newPerson}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'StrengthFieldMsg':
				var _p11 = _p8._0;
				var _p9 = A2(_elm_lang$core$Dict$get, _p11, model.strengthInputs);
				if (_p9.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
				} else {
					var _p10 = A2(_user$project$StrengthField$update, _p8._1, _p9._0);
					var newFieldModel = _p10._0;
					var cmd = _p10._1;
					var newStrengths = A3(_elm_lang$core$Dict$insert, _p11, newFieldModel, model.strengthInputs);
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Native_Utils.update(
							model,
							{strengthInputs: newStrengths}),
						_1: _elm_lang$core$Platform_Cmd$none
					};
				}
			case 'Delete':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _elm_lang$navigation$Navigation$newUrl('/')
				};
			case 'Save':
				return _user$project$PersonDetail$save(model);
			default:
				return A2(_MichaelCombs28$elm_mdl$Material$update, _p8._0, model);
		}
	});
var _user$project$PersonDetail$initWith = function (person) {
	var model = {
		person: person,
		strengthInputs: _user$project$PersonDetail$injectAllStrengths(person.strengths),
		mdl: _MichaelCombs28$elm_mdl$Material$model
	};
	return {ctor: '_Tuple2', _0: model, _1: _elm_lang$core$Platform_Cmd$none};
};
var _user$project$PersonDetail$initPerson = function (currentId) {
	return {id: currentId, name: '', strengths: _elm_lang$core$Maybe$Nothing};
};
var _user$project$PersonDetail$init = function (currentId) {
	var _p12 = _user$project$StrengthField$init;
	var fieldModel = _p12._0;
	var cmd = _p12._1;
	return {
		ctor: '_Tuple2',
		_0: {
			person: _user$project$PersonDetail$initPerson(currentId),
			strengthInputs: _elm_lang$core$Dict$fromList(
				A2(
					_elm_lang$core$List$indexedMap,
					F2(
						function (v0, v1) {
							return {ctor: '_Tuple2', _0: v0, _1: v1};
						}),
					A2(_elm_lang$core$List$repeat, 5, fieldModel))),
			mdl: _MichaelCombs28$elm_mdl$Material$model
		},
		_1: _elm_lang$core$Platform_Cmd$none
	};
};
var _user$project$PersonDetail$Model = F3(
	function (a, b, c) {
		return {person: a, strengthInputs: b, mdl: c};
	});
var _user$project$PersonDetail$Person = F3(
	function (a, b, c) {
		return {id: a, name: b, strengths: c};
	});
var _user$project$PersonDetail$Mdl = function (a) {
	return {ctor: 'Mdl', _0: a};
};
var _user$project$PersonDetail$Save = {ctor: 'Save'};
var _user$project$PersonDetail$Delete = {ctor: 'Delete'};
var _user$project$PersonDetail$StrengthFieldMsg = F2(
	function (a, b) {
		return {ctor: 'StrengthFieldMsg', _0: a, _1: b};
	});
var _user$project$PersonDetail$wrappedField = function (_p13) {
	var _p14 = _p13;
	var _p15 = _p14._0;
	var ordinal = _user$project$PersonDetail$getOrdinalNumber(_p15);
	return A2(
		_elm_lang$html$Html$map,
		_user$project$PersonDetail$StrengthFieldMsg(_p15),
		A2(_user$project$StrengthField$view, _p14._1, ordinal));
};
var _user$project$PersonDetail$NameInput = function (a) {
	return {ctor: 'NameInput', _0: a};
};
var _user$project$PersonDetail$view = function (model) {
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: A2(_user$project$PersonDetail_ops['=>'], 'padding', '20px'),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		},
		A2(
			_elm_lang$core$Basics_ops['++'],
			{
				ctor: '::',
				_0: A2(
					_elm_lang$html$Html$div,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A4(
							_MichaelCombs28$elm_mdl$Material_Textfield$render,
							_user$project$PersonDetail$Mdl,
							{
								ctor: '::',
								_0: 0,
								_1: {ctor: '[]'}
							},
							model.mdl,
							{
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Textfield$label('Name'),
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Textfield$floatingLabel,
									_1: {
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Textfield$onInput(_user$project$PersonDetail$NameInput),
										_1: {
											ctor: '::',
											_0: _MichaelCombs28$elm_mdl$Material_Textfield$value(model.person.name),
											_1: {
												ctor: '::',
												_0: _MichaelCombs28$elm_mdl$Material_Textfield$autofocus,
												_1: {
													ctor: '::',
													_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'width', '100%'),
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$List$map,
					_user$project$PersonDetail$wrappedField,
					_elm_lang$core$Dict$toList(model.strengthInputs)),
				{
					ctor: '::',
					_0: A2(
						_elm_lang$html$Html$div,
						{
							ctor: '::',
							_0: _elm_lang$html$Html_Attributes$style(
								{
									ctor: '::',
									_0: A2(_user$project$PersonDetail_ops['=>'], 'display', 'flex'),
									_1: {
										ctor: '::',
										_0: A2(_user$project$PersonDetail_ops['=>'], 'justify-content', 'space-between'),
										_1: {ctor: '[]'}
									}
								}),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: A5(
								_MichaelCombs28$elm_mdl$Material_Button$render,
								_user$project$PersonDetail$Mdl,
								{
									ctor: '::',
									_0: 0,
									_1: {ctor: '[]'}
								},
								model.mdl,
								{
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Button$raised,
									_1: {
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Button$ripple,
										_1: {
											ctor: '::',
											_0: _MichaelCombs28$elm_mdl$Material_Button$onClick(_user$project$PersonDetail$Delete),
											_1: {ctor: '[]'}
										}
									}
								},
								{
									ctor: '::',
									_0: _elm_lang$html$Html$text('Delete'),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: A5(
									_MichaelCombs28$elm_mdl$Material_Button$render,
									_user$project$PersonDetail$Mdl,
									{
										ctor: '::',
										_0: 1,
										_1: {ctor: '[]'}
									},
									model.mdl,
									{
										ctor: '::',
										_0: _MichaelCombs28$elm_mdl$Material_Button$raised,
										_1: {
											ctor: '::',
											_0: _MichaelCombs28$elm_mdl$Material_Button$colored,
											_1: {
												ctor: '::',
												_0: _MichaelCombs28$elm_mdl$Material_Button$ripple,
												_1: {
													ctor: '::',
													_0: _MichaelCombs28$elm_mdl$Material_Button$onClick(_user$project$PersonDetail$Save),
													_1: {ctor: '[]'}
												}
											}
										}
									},
									{
										ctor: '::',
										_0: _elm_lang$html$Html$text('Save'),
										_1: {ctor: '[]'}
									}),
								_1: {ctor: '[]'}
							}
						}),
					_1: {ctor: '[]'}
				})));
};

var _user$project$FriendList$subscriptions = function (model) {
	return _elm_lang$core$Platform_Sub$none;
};
var _user$project$FriendList$strengthsInfo = function (person) {
	return A2(
		_MichaelCombs28$elm_mdl$Material_List$subtitle,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(
				A2(
					_elm_lang$core$String$join,
					', ',
					_user$project$Strengths$getStrengthNameListFromCodex(person.strengths))),
			_1: {ctor: '[]'}
		});
};
var _user$project$FriendList_ops = _user$project$FriendList_ops || {};
_user$project$FriendList_ops['=>'] = F2(
	function (v0, v1) {
		return {ctor: '_Tuple2', _0: v0, _1: v1};
	});
var _user$project$FriendList$insertId = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$core$Native_Utils.update(
		_p1._1,
		{id: _p1._0});
};
var _user$project$FriendList$makePerson = F2(
	function (name, maybeCodex) {
		var codex = _elm_lang$core$Native_Utils.eq(maybeCodex, '') ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(maybeCodex);
		return {id: 0, name: name, strengths: codex};
	});
var _user$project$FriendList$decodeFriend = function () {
	var asdf = A3(
		_elm_lang$core$Json_Decode$map2,
		_user$project$FriendList$makePerson,
		A2(_elm_lang$core$Json_Decode$field, 'n', _elm_lang$core$Json_Decode$string),
		A2(_elm_lang$core$Json_Decode$field, 's', _elm_lang$core$Json_Decode$string));
	return asdf;
}();
var _user$project$FriendList$decodeFriends = function (json) {
	var jsonList = A2(
		_elm_lang$core$Json_Decode$decodeString,
		_elm_lang$core$Json_Decode$list(_user$project$FriendList$decodeFriend),
		json);
	var indexedList = function () {
		var _p2 = jsonList;
		if (_p2.ctor === 'Ok') {
			return A2(
				_elm_lang$core$List$indexedMap,
				F2(
					function (v0, v1) {
						return {ctor: '_Tuple2', _0: v0, _1: v1};
					}),
				_p2._0);
		} else {
			return {ctor: '[]'};
		}
	}();
	return A2(_elm_lang$core$List$map, _user$project$FriendList$insertId, indexedList);
};
var _user$project$FriendList$create = function (model) {
	var newId = model.nextId + 1;
	var newPerson = A3(_user$project$PersonDetail$Person, model.nextId, '', _elm_lang$core$Maybe$Nothing);
	var newFriends = {ctor: '::', _0: newPerson, _1: model.friends};
	return {
		ctor: '_Tuple2',
		_0: _elm_lang$core$Native_Utils.update(
			model,
			{
				friends: newFriends,
				selected: _elm_lang$core$Maybe$Just(model.nextId),
				nextId: newId
			}),
		_1: _elm_lang$navigation$Navigation$newUrl('#add')
	};
};
var _user$project$FriendList$update = F2(
	function (msg, model) {
		var _p3 = msg;
		switch (_p3.ctor) {
			case 'Create':
				return _user$project$FriendList$create(model);
			case 'Select':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{
							selected: _elm_lang$core$Maybe$Just(_p3._0.id)
						}),
					_1: _elm_lang$navigation$Navigation$newUrl('#add')
				};
			case 'Save':
				var _p4 = _p3._0;
				var newFriends = A2(
					_elm_lang$core$List$map,
					function (friend) {
						return _elm_lang$core$Native_Utils.eq(friend.id, _p4.id) ? _elm_lang$core$Native_Utils.update(
							friend,
							{name: _p4.name, strengths: _p4.strengths}) : friend;
					},
					model.friends);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{friends: newFriends, selected: _elm_lang$core$Maybe$Nothing}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Delete':
				var newFriends = A2(
					_elm_lang$core$List$filter,
					function (f) {
						return !_elm_lang$core$Native_Utils.eq(f.id, _p3._0.id);
					},
					model.friends);
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{friends: newFriends, selected: _elm_lang$core$Maybe$Nothing}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			default:
				return A2(_MichaelCombs28$elm_mdl$Material$update, _p3._0, model);
		}
	});
var _user$project$FriendList$Model = F5(
	function (a, b, c, d, e) {
		return {friends: a, selected: b, nextId: c, viewState: d, mdl: e};
	});
var _user$project$FriendList$Flags = F2(
	function (a, b) {
		return {friendList: a, viewState: b};
	});
var _user$project$FriendList$Collapsed = {ctor: 'Collapsed'};
var _user$project$FriendList$Expanded = {ctor: 'Expanded'};
var _user$project$FriendList$init = function (flags) {
	var initFriends = function () {
		var _p5 = flags.friendList;
		if (_p5.ctor === 'Nothing') {
			return {ctor: '[]'};
		} else {
			return _user$project$FriendList$decodeFriends(_p5._0);
		}
	}();
	var initNextId = _elm_lang$core$List$length(initFriends);
	var initModel = {friends: initFriends, selected: _elm_lang$core$Maybe$Nothing, nextId: initNextId, viewState: _user$project$FriendList$Expanded, mdl: _MichaelCombs28$elm_mdl$Material$model};
	return {ctor: '_Tuple2', _0: initModel, _1: _elm_lang$core$Platform_Cmd$none};
};
var _user$project$FriendList$Mdl = function (a) {
	return {ctor: 'Mdl', _0: a};
};
var _user$project$FriendList$Delete = function (a) {
	return {ctor: 'Delete', _0: a};
};
var _user$project$FriendList$Save = function (a) {
	return {ctor: 'Save', _0: a};
};
var _user$project$FriendList$Select = function (a) {
	return {ctor: 'Select', _0: a};
};
var _user$project$FriendList$personView = F3(
	function (viewState, model, person) {
		var _p6 = viewState;
		if (_p6.ctor === 'Collapsed') {
			return A2(
				_MichaelCombs28$elm_mdl$Material_List$li,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: A2(
						_MichaelCombs28$elm_mdl$Material_List$content,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text(person.name),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A5(
							_MichaelCombs28$elm_mdl$Material_Button$render,
							_user$project$FriendList$Mdl,
							{
								ctor: '::',
								_0: person.id,
								_1: {ctor: '[]'}
							},
							model.mdl,
							{
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Button$icon,
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Button$onClick(
										_user$project$FriendList$Select(person)),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Icon$i('create'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				});
		} else {
			return A2(
				_MichaelCombs28$elm_mdl$Material_List$li,
				{
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_List$withSubtitle,
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: A2(
						_MichaelCombs28$elm_mdl$Material_List$content,
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text(person.name),
							_1: {
								ctor: '::',
								_0: _user$project$FriendList$strengthsInfo(person),
								_1: {ctor: '[]'}
							}
						}),
					_1: {
						ctor: '::',
						_0: A5(
							_MichaelCombs28$elm_mdl$Material_Button$render,
							_user$project$FriendList$Mdl,
							{
								ctor: '::',
								_0: person.id,
								_1: {ctor: '[]'}
							},
							model.mdl,
							{
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Button$icon,
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Button$onClick(
										_user$project$FriendList$Select(person)),
									_1: {ctor: '[]'}
								}
							},
							{
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Icon$i('create'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				});
		}
	});
var _user$project$FriendList$view = F2(
	function (model, viewState) {
		return A2(
			_MichaelCombs28$elm_mdl$Material_List$ul,
			{ctor: '[]'},
			A2(
				_elm_lang$core$List$map,
				A2(_user$project$FriendList$personView, viewState, model),
				A2(
					_elm_lang$core$List$sortBy,
					function (_) {
						return _.name;
					},
					model.friends)));
	});
var _user$project$FriendList$Create = {ctor: 'Create'};

var _user$project$Main$pageToHash = function (page) {
	var _p0 = page;
	switch (_p0.ctor) {
		case 'FriendListPage':
			return '/';
		case 'PersonDetailPage':
			return '/#add';
		default:
			return '/#';
	}
};
var _user$project$Main_ops = _user$project$Main_ops || {};
_user$project$Main_ops['=>'] = F2(
	function (v0, v1) {
		return {ctor: '_Tuple2', _0: v0, _1: v1};
	});
var _user$project$Main$encodeViewState = function (viewState) {
	var _p1 = viewState;
	if (_p1.ctor === 'Expanded') {
		return _elm_lang$core$Json_Encode$string('Expanded');
	} else {
		return _elm_lang$core$Json_Encode$string('Collapsed');
	}
};
var _user$project$Main$decodeViewState = function (json) {
	var jsonViewState = A2(_elm_lang$core$Json_Decode$decodeString, _elm_lang$core$Json_Decode$string, json);
	var viewState = function () {
		var _p2 = jsonViewState;
		if (_p2.ctor === 'Ok') {
			var _p3 = _p2._0;
			switch (_p3) {
				case 'Expanded':
					return _user$project$FriendList$Expanded;
				case 'Collapsed':
					return _user$project$FriendList$Collapsed;
				default:
					return _user$project$FriendList$Expanded;
			}
		} else {
			return _user$project$FriendList$Expanded;
		}
	}();
	return viewState;
};
var _user$project$Main$encodeFriend = function (person) {
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'n',
				_1: _elm_lang$core$Json_Encode$string(person.name)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 's',
					_1: _elm_lang$core$Json_Encode$string(
						A2(_elm_lang$core$Maybe$withDefault, '', person.strengths))
				},
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$encodeFriends = function (model) {
	return _elm_lang$core$Json_Encode$list(
		A2(_elm_lang$core$List$map, _user$project$Main$encodeFriend, model.friends));
};
var _user$project$Main$updateListFromPerson = F3(
	function (msg, detailModel, model) {
		var _p4 = msg;
		switch (_p4.ctor) {
			case 'Save':
				var _p5 = A2(
					_user$project$FriendList$update,
					_user$project$FriendList$Save(detailModel.person),
					model.list);
				var newListModel = _p5._0;
				var cmd = _p5._1;
				return newListModel;
			case 'Delete':
				var _p6 = A2(
					_user$project$FriendList$update,
					_user$project$FriendList$Delete(detailModel.person),
					model.list);
				var newListModel = _p6._0;
				var cmd = _p6._1;
				return newListModel;
			default:
				return model.list;
		}
	});
var _user$project$Main$updateDetailFromList = F2(
	function (msg, model) {
		var _p7 = msg;
		if (_p7.ctor === 'Select') {
			var _p8 = _user$project$PersonDetail$initWith(_p7._0);
			var newDetailModel = _p8._0;
			var cmd = _p8._1;
			return newDetailModel;
		} else {
			return model.detail;
		}
	});
var _user$project$Main$create = function (model) {
	var _p9 = _user$project$PersonDetail$init(model.list.nextId);
	var newDetailModel = _p9._0;
	var detailCmd = _p9._1;
	var _p10 = A2(_user$project$FriendList$update, _user$project$FriendList$Create, model.list);
	var newListModel = _p10._0;
	var listCmd = _p10._1;
	return {
		ctor: '_Tuple2',
		_0: _elm_lang$core$Native_Utils.update(
			model,
			{list: newListModel, detail: newDetailModel}),
		_1: _elm_lang$navigation$Navigation$newUrl('#add')
	};
};
var _user$project$Main$saveFriendList = _elm_lang$core$Native_Platform.outgoingPort(
	'saveFriendList',
	function (v) {
		return v;
	});
var _user$project$Main$saveViewState = _elm_lang$core$Native_Platform.outgoingPort(
	'saveViewState',
	function (v) {
		return v;
	});
var _user$project$Main$Flags = F2(
	function (a, b) {
		return {friendList: a, viewState: b};
	});
var _user$project$Main$Model = F5(
	function (a, b, c, d, e) {
		return {page: a, list: b, detail: c, viewState: d, mdl: e};
	});
var _user$project$Main$PersonDetailPage = {ctor: 'PersonDetailPage'};
var _user$project$Main$FriendListPage = {ctor: 'FriendListPage'};
var _user$project$Main$NotFound = {ctor: 'NotFound'};
var _user$project$Main$hashToPage = function (hash) {
	var _p11 = hash;
	switch (_p11) {
		case '':
			return _user$project$Main$FriendListPage;
		case '#add':
			return _user$project$Main$PersonDetailPage;
		default:
			return _user$project$Main$NotFound;
	}
};
var _user$project$Main$Mdl = function (a) {
	return {ctor: 'Mdl', _0: a};
};
var _user$project$Main$FriendListMsg = function (a) {
	return {ctor: 'FriendListMsg', _0: a};
};
var _user$project$Main$messageFromList = F2(
	function (msg, model) {
		var newDetailModel = A2(_user$project$Main$updateDetailFromList, msg, model);
		var _p12 = A2(_user$project$FriendList$update, msg, model.list);
		var newListModel = _p12._0;
		var cmd = _p12._1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{list: newListModel, detail: newDetailModel}),
			_1: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Main$FriendListMsg, cmd)
		};
	});
var _user$project$Main$PersonDetailMsg = function (a) {
	return {ctor: 'PersonDetailMsg', _0: a};
};
var _user$project$Main$init = F2(
	function (flags, location) {
		var viewState = function () {
			var _p13 = flags.viewState;
			if (_p13.ctor === 'Nothing') {
				return _user$project$FriendList$Expanded;
			} else {
				return _user$project$Main$decodeViewState(_p13._0);
			}
		}();
		var _p14 = _user$project$PersonDetail$init(0);
		var personDetailModel = _p14._0;
		var personDetailCmd = _p14._1;
		var _p15 = _user$project$FriendList$init(flags);
		var friendListModel = _p15._0;
		var friendListCmd = _p15._1;
		var cmds = _elm_lang$core$Platform_Cmd$batch(
			{
				ctor: '::',
				_0: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Main$FriendListMsg, friendListCmd),
				_1: {
					ctor: '::',
					_0: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Main$PersonDetailMsg, personDetailCmd),
					_1: {ctor: '[]'}
				}
			});
		var page = _user$project$Main$hashToPage(location.hash);
		var initModel = {page: page, list: friendListModel, detail: personDetailModel, viewState: viewState, mdl: _MichaelCombs28$elm_mdl$Material$model};
		return {ctor: '_Tuple2', _0: initModel, _1: cmds};
	});
var _user$project$Main$messageFromPerson = F2(
	function (msg, model) {
		var _p16 = A2(_user$project$PersonDetail$update, msg, model.detail);
		var newDetailModel = _p16._0;
		var cmd = _p16._1;
		var newListModel = A3(_user$project$Main$updateListFromPerson, msg, newDetailModel, model);
		var saveCmd = _elm_lang$core$Native_Utils.eq(msg, _user$project$PersonDetail$Save) ? _user$project$Main$saveFriendList(
			_user$project$Main$encodeFriends(newListModel)) : _elm_lang$core$Platform_Cmd$none;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Native_Utils.update(
				model,
				{list: newListModel, detail: newDetailModel}),
			_1: _elm_lang$core$Platform_Cmd$batch(
				{
					ctor: '::',
					_0: A2(_elm_lang$core$Platform_Cmd$map, _user$project$Main$PersonDetailMsg, cmd),
					_1: {
						ctor: '::',
						_0: saveCmd,
						_1: {ctor: '[]'}
					}
				})
		};
	});
var _user$project$Main$update = F2(
	function (msg, model) {
		var _p17 = msg;
		switch (_p17.ctor) {
			case 'Navigate':
				return {
					ctor: '_Tuple2',
					_0: model,
					_1: _elm_lang$navigation$Navigation$newUrl(
						_user$project$Main$pageToHash(_p17._0))
				};
			case 'ChangePage':
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{page: _p17._0}),
					_1: _elm_lang$core$Platform_Cmd$none
				};
			case 'Create':
				return _user$project$Main$create(model);
			case 'ToggleViewState':
				var newViewState = function () {
					var _p18 = model.viewState;
					if (_p18.ctor === 'Collapsed') {
						return _user$project$FriendList$Expanded;
					} else {
						return _user$project$FriendList$Collapsed;
					}
				}();
				var saveCmd = _user$project$Main$saveViewState(
					_user$project$Main$encodeViewState(newViewState));
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Native_Utils.update(
						model,
						{viewState: newViewState}),
					_1: saveCmd
				};
			case 'FriendListMsg':
				return A2(_user$project$Main$messageFromList, _p17._0, model);
			case 'PersonDetailMsg':
				return A2(_user$project$Main$messageFromPerson, _p17._0, model);
			default:
				return A2(_MichaelCombs28$elm_mdl$Material$update, _p17._0, model);
		}
	});
var _user$project$Main$subscriptions = function (model) {
	var personDetailSub = _user$project$PersonDetail$subscriptions(model.detail);
	var friendListSub = _user$project$FriendList$subscriptions(model.list);
	return _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: A2(_elm_lang$core$Platform_Sub$map, _user$project$Main$FriendListMsg, friendListSub),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Platform_Sub$map, _user$project$Main$PersonDetailMsg, personDetailSub),
				_1: {ctor: '[]'}
			}
		});
};
var _user$project$Main$ToggleViewState = {ctor: 'ToggleViewState'};
var _user$project$Main$pageHeader = function (model) {
	var label = function () {
		var _p19 = model.viewState;
		if (_p19.ctor === 'Collapsed') {
			return 'Show Strengths';
		} else {
			return 'Hide Strengths';
		}
	}();
	var menu = function () {
		var _p20 = model.page;
		if (_p20.ctor === 'FriendListPage') {
			return A5(
				_MichaelCombs28$elm_mdl$Material_Menu$render,
				_user$project$Main$Mdl,
				{
					ctor: '::',
					_0: 1,
					_1: {ctor: '[]'}
				},
				model.mdl,
				{
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Menu$ripple,
					_1: {
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Menu$bottomRight,
						_1: {ctor: '[]'}
					}
				},
				{
					ctor: '::',
					_0: A2(
						_MichaelCombs28$elm_mdl$Material_Menu$item,
						{
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Menu$onSelect(_user$project$Main$ToggleViewState),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$html$Html$text(label),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				});
		} else {
			return A2(
				_elm_lang$html$Html$div,
				{ctor: '[]'},
				{ctor: '[]'});
		}
	}();
	return A2(
		_MichaelCombs28$elm_mdl$Material_Layout$row,
		{ctor: '[]'},
		{
			ctor: '::',
			_0: A2(
				_MichaelCombs28$elm_mdl$Material_Layout$title,
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$html$Html$text('Strengths Friender'),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: _MichaelCombs28$elm_mdl$Material_Layout$spacer,
				_1: {
					ctor: '::',
					_0: menu,
					_1: {ctor: '[]'}
				}
			}
		});
};
var _user$project$Main$viewToggle = function (model) {
	var buttonLabel = function () {
		var _p21 = model.viewState;
		if (_p21.ctor === 'Collapsed') {
			return 'Show Strengths';
		} else {
			return 'Hide Strengths';
		}
	}();
	return A2(
		_elm_lang$html$Html$button,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Events$onClick(_user$project$Main$ToggleViewState),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$html$Html$text(buttonLabel),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$Create = {ctor: 'Create'};
var _user$project$Main$addButton = function (model) {
	var _p22 = model.page;
	if (_p22.ctor === 'FriendListPage') {
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$style(
					{
						ctor: '::',
						_0: A2(_user$project$Main_ops['=>'], 'position', 'absolute'),
						_1: {
							ctor: '::',
							_0: A2(_user$project$Main_ops['=>'], 'right', '0px'),
							_1: {
								ctor: '::',
								_0: A2(_user$project$Main_ops['=>'], 'bottom', '24px'),
								_1: {ctor: '[]'}
							}
						}
					}),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A5(
					_MichaelCombs28$elm_mdl$Material_Button$render,
					_user$project$Main$Mdl,
					{
						ctor: '::',
						_0: 0,
						_1: {ctor: '[]'}
					},
					model.mdl,
					{
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Button$fab,
						_1: {
							ctor: '::',
							_0: _MichaelCombs28$elm_mdl$Material_Button$colored,
							_1: {
								ctor: '::',
								_0: _MichaelCombs28$elm_mdl$Material_Button$ripple,
								_1: {
									ctor: '::',
									_0: _MichaelCombs28$elm_mdl$Material_Button$onClick(_user$project$Main$Create),
									_1: {
										ctor: '::',
										_0: A2(_MichaelCombs28$elm_mdl$Material_Options$css, 'margin', '0 24px'),
										_1: {ctor: '[]'}
									}
								}
							}
						}
					},
					{
						ctor: '::',
						_0: _MichaelCombs28$elm_mdl$Material_Icon$i('add'),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			});
	} else {
		return A2(
			_elm_lang$html$Html$div,
			{ctor: '[]'},
			{ctor: '[]'});
	}
};
var _user$project$Main$view = function (model) {
	var page = function () {
		var _p23 = model.page;
		switch (_p23.ctor) {
			case 'FriendListPage':
				return A2(
					_elm_lang$html$Html$map,
					_user$project$Main$FriendListMsg,
					A2(_user$project$FriendList$view, model.list, model.viewState));
			case 'PersonDetailPage':
				return A2(
					_elm_lang$html$Html$map,
					_user$project$Main$PersonDetailMsg,
					_user$project$PersonDetail$view(model.detail));
			default:
				return A2(
					_elm_lang$html$Html$div,
					{
						ctor: '::',
						_0: _elm_lang$html$Html_Attributes$class('main'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$html$Html$h1,
							{ctor: '[]'},
							{
								ctor: '::',
								_0: _elm_lang$html$Html$text('Page Not Found!'),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					});
		}
	}();
	return A2(
		_elm_lang$html$Html$div,
		{
			ctor: '::',
			_0: _elm_lang$html$Html_Attributes$class('mdl-layout--no-drawer-button'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: A4(
				_MichaelCombs28$elm_mdl$Material_Layout$render,
				_user$project$Main$Mdl,
				model.mdl,
				{
					ctor: '::',
					_0: _MichaelCombs28$elm_mdl$Material_Layout$fixedHeader,
					_1: {ctor: '[]'}
				},
				{
					header: {
						ctor: '::',
						_0: _user$project$Main$pageHeader(model),
						_1: {ctor: '[]'}
					},
					drawer: {ctor: '[]'},
					tabs: {
						ctor: '_Tuple2',
						_0: {ctor: '[]'},
						_1: {ctor: '[]'}
					},
					main: {
						ctor: '::',
						_0: page,
						_1: {
							ctor: '::',
							_0: _user$project$Main$addButton(model),
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {ctor: '[]'}
		});
};
var _user$project$Main$ChangePage = function (a) {
	return {ctor: 'ChangePage', _0: a};
};
var _user$project$Main$locationToMsg = function (location) {
	return _user$project$Main$ChangePage(
		_user$project$Main$hashToPage(location.hash));
};
var _user$project$Main$main = A2(
	_elm_lang$navigation$Navigation$programWithFlags,
	_user$project$Main$locationToMsg,
	{init: _user$project$Main$init, update: _user$project$Main$update, view: _user$project$Main$view, subscriptions: _user$project$Main$subscriptions})(
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (friendList) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (viewState) {
					return _elm_lang$core$Json_Decode$succeed(
						{friendList: friendList, viewState: viewState});
				},
				A2(
					_elm_lang$core$Json_Decode$field,
					'viewState',
					_elm_lang$core$Json_Decode$oneOf(
						{
							ctor: '::',
							_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
								_1: {ctor: '[]'}
							}
						})));
		},
		A2(
			_elm_lang$core$Json_Decode$field,
			'friendList',
			_elm_lang$core$Json_Decode$oneOf(
				{
					ctor: '::',
					_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, _elm_lang$core$Json_Decode$string),
						_1: {ctor: '[]'}
					}
				}))));
var _user$project$Main$Navigate = function (a) {
	return {ctor: 'Navigate', _0: a};
};

var Elm = {};
Elm['Main'] = Elm['Main'] || {};
if (typeof _user$project$Main$main !== 'undefined') {
    _user$project$Main$main(Elm['Main'], 'Main', undefined);
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);
