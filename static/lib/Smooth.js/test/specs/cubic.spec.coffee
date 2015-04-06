{Smooth} = require '../../Smooth.coffee'

{deriv} = require './util.coffee'


describe 'Cubic Interpolator', ->
	describe 'Catmull-Rom', ->
		arr = [4,6,-2,3]
		s = Smooth arr, method:Smooth.METHOD_CUBIC, cubicTension: Smooth.CATMULL_ROM

		it 'should match integer indexes', ->
			expect(s 0).toEqual arr[0]
			expect(s 1).toEqual arr[1]
			expect(s 2).toEqual arr[2]
			expect(s 3).toEqual arr[3]

		it 'should have neighbor-slope tangent at integers', ->
			expect(deriv(s) 1).toBeCloseTo (arr[2]-arr[0])/2
			expect(deriv(s) 2).toBeCloseTo (arr[3]-arr[1])/2

		it 'should repeat when periodic', ->
		p = Smooth arr, method:'cubic', cubicTension: Smooth.CATMULL_ROM, clip:'periodic', scaleTo: 1
		for i in [-2..2] by 1/16
			expect(p i).toEqual p i - Math.floor i

	describe 'Tension=1', ->
		arr = [8,2,-4,9]
		s = Smooth arr, method:Smooth.METHOD_CUBIC, cubicTension: 1


		it 'should match integer indexes', ->
			expect(s 0).toEqual arr[0]
			expect(s 1).toEqual arr[1]
			expect(s 2).toEqual arr[2]
			expect(s 3).toEqual arr[3]

		it 'should have zero derivatives at integers', ->
			expect(deriv(s) 0).toBeCloseTo 0
			expect(deriv(s) 1).toBeCloseTo 0
			expect(deriv(s) 2).toBeCloseTo 0
			expect(deriv(s) 3).toBeCloseTo 0