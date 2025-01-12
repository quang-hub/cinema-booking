package com.quangcd.cinemaproject.utils;

public class CodeTestUtils {
    interface Animal {
        boolean eat();
    }

    interface Pet extends Animal {
    }

    public static class Dog implements Pet {

        @Override
        public boolean eat() {
            System.out.println("test");
            return false;
        }
    }
    public static void main(String[] args) {
        String a = "asd";
        StringBuffer b = new StringBuffer("asd");
        Dog d= new Dog();
        System.out.println(d.eat());
    }
}
