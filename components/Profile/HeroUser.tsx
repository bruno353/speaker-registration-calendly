/* eslint-disable dot-notation */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
'use client'
// import { useState } from 'react'
import { useEffect, useState, useCallback } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { UserOutlined } from '@ant-design/icons'
import TransactionList from '../TaskTransactionsList'
import { ethers } from 'ethers'
import { useAccount, useNetwork } from 'wagmi'
import {
  readContract,
  writeContract,
  prepareWriteContract,
  waitForTransaction,
} from '@wagmi/core'
import taskContractABI from '@/utils/abi/taskContractABI.json'
import erc20ContractABI from '@/utils/abi/erc20ContractABI.json'
import axios from 'axios'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { User } from '@/types/user'

interface UsersModalProps {
  user: User
  id: string
  ensName: string
}

const HeroUser = ({ user, id, ensName }: UsersModalProps) => {
  const taskStateCircle = {
    open: 'circle-green-task.svg',
    taken: 'circle-yellow-task.svg',
    closed: 'circle-gray-task.svg',
  }

  const taskStatusToButton = {
    open: 'Apply now',
  }

  // USDC, USDT AND WETH for POLYGON
  const tokensAllowedMap = {
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': 'usd-coin-usdc-logo',
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F': 'tether-usdt-logo',
    '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619': 'generic-erc20',
  }

  function getTokenLogo(address: string) {
    if (tokensAllowedMap[address]) {
      return tokensAllowedMap[address]
    } else {
      return 'generic-erc20'
    }
  }

  function findGithubLink(array) {
    const item = array.find((obj) => obj.title === 'githubLink')

    if (item) {
      if (item.url.startsWith('https://')) {
        return item.url
      } else {
        return 'https://' + item.url
      }
    } else {
      return 'https://www.github.com'
    }
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
  }

  function formatDate(timestamp: string) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]

    const date = new Date(Number(timestamp) * 1000)

    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()

    return `${day} ${month} ${year}`
  }

  function formatAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleCopyClick = useCallback(() => {
    // Usar API de clipboard para copiar o endereço
    navigator.clipboard.writeText(id)
    // mensagem de erro
  }, [id])

  return (
    <section className="border-b border-[#CFCFCF] px-[100px] pt-[59px] pb-[70px]">
      <div className="container px-[0px] text-[16px] font-medium !leading-[19px] text-[#000000]">
        <div className="flex">
          <div className="flex cursor-pointer items-center">
            <img
              alt="ethereum avatar"
              src={`https://effigy.im/a/${id}.svg`}
              className="w-[50px] rounded-full"
            ></img>
          </div>
          <div
            title={id}
            className="mr-4 ml-[20px] flex items-center text-[30px] font-bold text-[#D4D4D4]"
          >
            {ensName || formatAddress(id)}
          </div>
          <div
            onClick={handleCopyClick}
            className="flex cursor-pointer items-center"
          >
            <img
              src={`/images/profile/copy.svg`}
              alt="image"
              className={`w-[17.5px]`}
            />
          </div>
          {/* <div className="ml-auto flex cursor-pointer items-center  justify-end">
            <a className="flex w-[217px] justify-center rounded-[5px] bg-[#12AD50] py-1 text-[16px] font-bold  text-white hover:bg-[#0e7a39]">
              <img
                src={`/images/profile/check.svg`}
                alt="image"
                className={`mr-2 w-[20.11px]`}
              />
              <span className="">Verified Contributor</span>
            </a>
          </div> */}
        </div>
        <div className="mt-[25px] flex">
          <p>Tags:</p>
          <div className="ml-auto flex cursor-pointer items-center  justify-end">
            <a className="flex h-[29px] w-[116px] items-center justify-center rounded-[5px] bg-[#000000] text-[16px] font-bold  text-white hover:bg-[#202020]">
              <span className="">Edit Profile</span>
            </a>
          </div>
        </div>
        <div className="mt-[25px] flex">
          <div className="flex">
            <div className="mr-[60px] flex">
              <img
                src={`/images/profile/clock.svg`}
                alt="image"
                className={`mr-2 w-[18px]`}
              />
              <span className="flex items-center">
                Contributor since:{' '}
                <span className="ml-1 font-bold text-[#303030]">
                  12 Jul 2023
                </span>
              </span>
            </div>
            <div className="mr-[60px] flex">
              <img
                src={`/images/profile/coins.svg`}
                alt="image"
                className={`mr-2 w-[18px]`}
              />
              <span className="flex items-center">Total earned:</span>
            </div>
            <div className="mr-[60px] flex">
              <img
                src={`/images/profile/people.svg`}
                alt="image"
                className={`mr-2 w-[18px]`}
              />
              <span className="flex items-center">Job success:</span>
            </div>
          </div>
          <div className="ml-auto flex w-[107px] justify-between">
            <div className="flex items-center">
              <img
                src={`/images/profile/github.svg`}
                alt="image"
                className={`w-[24.2px]`}
              />
            </div>
            <div className="flex items-center">
              <img
                src={`/images/profile/twitter.svg`}
                alt="image"
                className={`w-[25px]`}
              />
            </div>
            <div className="flex items-center">
              <img
                src={`/images/profile/share.svg`}
                alt="image"
                className={`w-[21.88px]`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroUser