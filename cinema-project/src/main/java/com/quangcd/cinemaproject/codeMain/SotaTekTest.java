package com.quangcd.cinemaproject.codeMain;

import java.util.Scanner;

public class SotaTekTest {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        int[] nums = {3,2,2,3};
        int val=2;

        System.out.println(removeElement(nums,val));
    }
    public static int tongSoKeo(int n,int c,int m){
        //6 2 2
        int soKeoMuaDcLanDau=n/c; //3
        int soKeoDoiDcLanDau=soKeoMuaDcLanDau/m;
        int temp = soKeoMuaDcLanDau; //3

        int ketQua=soKeoMuaDcLanDau+soKeoDoiDcLanDau; //3
        int soKeoDoiDc=temp/m; // 3/2=1
        int soGiayGoiConthua= temp % m; //1

        while((soKeoDoiDc+soGiayGoiConthua)>=m){
            temp=soKeoDoiDc+soGiayGoiConthua;
            soKeoDoiDc=temp/m; // 3/2=1
            soGiayGoiConthua= temp % m; //1
            ketQua+=soKeoDoiDc;
        }
        return ketQua;
    }

    public static int removeElement(int[] nums, int val) {
        int sum =0 ;
        for(int i=0;i<nums.length;i++){
            if(nums[i]==val){
                sum++;
                if((i+1)>nums.length) break;
                nums[i]=nums[i+1];
                if(nums[i+1]==val){
                    sum++;
                }
            }
        }
        return nums.length - sum;
    }

}
