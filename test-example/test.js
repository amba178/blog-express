const assert = require('chai').assert
const expect = require('expect.js')
let expected, current 
before(()=>{
	expected = ['a', 'b', 'c']
})
beforeEach(()=>{
	current = 'a,b,c'.split(',')
})

describe('String#split', ()=>{
	it('should return an array', ()=>{
		expect(Array.isArray(current)).to.be(true)
	})
	it('should return the same array', ()=>{
		expect(expected.length).to.equal(current.length)
		for(let i = 0; i < expected.length; i++){
			expect(expected[i]).equal(current[i])
		}
	})
})