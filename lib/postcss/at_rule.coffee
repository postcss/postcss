# Copyright 2013 Andrey Sitnik <andrey@sitnik.ru>,
# sponsored by Evil Martians.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public License
# along with this program.  If not, see <http:#www.gnu.org/licenses/>.

RulesList        = require('./rules_list')
DeclarationsList = require('./declarations_list')

# CSS at-rule like “@keyframes name { }”.
#
# Can contain declarations (like @font-face or @page) ot another rules.
class AtRule
  constructor: ->
    @type    = 'atrule'
    @content = 'empty'

  # Is rule will contain declarations or another rules
  setContent: (type) ->
    @content = type
    if type == 'decls'
      @decls = []
      @__proto__ = AtRule.withDeclarations
    else if type == 'rules'
      @rules = []
      @__proto__ = AtRule.withRules

  # Change content type depend on object type and then call mixin’s method.
  push: (obj) ->
    @setContent(obj.type + 's')
    @push(obj)

AtRule.withRules        = RulesList.copy(AtRule)
AtRule.withDeclarations = DeclarationsList.copy(AtRule)

module.exports = AtRule
