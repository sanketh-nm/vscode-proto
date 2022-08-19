'use strict';

export module PrimitiveTypes {

    export const primitiveTypes = [
        'double',
        'float',
        'int32',
        'int64',
        'uint32',
        'uint64',
        'sint32',
        'sint64',
        'fixed32',
        'fixed64',
        'sfixed32',
        'sfixed64',
        'bool',
        'string'
    ];

    export const isPrimitiveType = (type: string): boolean => primitiveTypes.indexOf(type) > -1;

}

